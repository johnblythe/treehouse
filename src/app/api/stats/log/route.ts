import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stats, activityLog, streaks, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  STAT_TYPES,
  StatType,
  ActivityType,
  XP_VALUES,
  getLevelFromXp,
} from "@/lib/stats";

interface LogActivityRequest {
  memberId: string;
  activityType: ActivityType;
  statAffected: StatType;
  description?: string;
  metadata?: Record<string, unknown>;
  // For self_report
  wasHard?: boolean;
  hasDescription?: boolean;
}

// POST log activity and grant XP
export async function POST(request: NextRequest) {
  try {
    const body: LogActivityRequest = await request.json();
    const {
      memberId,
      activityType,
      statAffected,
      description,
      metadata,
      wasHard,
      hasDescription,
    } = body;

    // Validate inputs
    if (!memberId || !activityType || !statAffected) {
      return NextResponse.json(
        { error: "memberId, activityType, and statAffected are required" },
        { status: 400 }
      );
    }

    if (!STAT_TYPES.includes(statAffected)) {
      return NextResponse.json(
        { error: `Invalid statAffected: ${statAffected}` },
        { status: 400 }
      );
    }

    // Verify member exists
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Calculate XP based on activity type
    let xpGained = 0;

    switch (activityType) {
      case "self_report":
        xpGained = XP_VALUES.self_report.base;
        if (wasHard) xpGained += XP_VALUES.self_report.hardBonus;
        if (hasDescription || description) xpGained += XP_VALUES.self_report.descriptionBonus;
        break;
      case "check_in":
        xpGained = XP_VALUES.check_in.base;
        break;
      case "micro_app":
        const appType = metadata?.app as keyof typeof XP_VALUES.micro_app;
        xpGained = XP_VALUES.micro_app[appType] ?? 10;
        break;
      case "bounce_back":
        xpGained = XP_VALUES.bounce_back.base;
        break;
      default:
        xpGained = 10; // fallback
    }

    // Log the activity
    const [activity] = await db
      .insert(activityLog)
      .values({
        memberId,
        activityType,
        statAffected,
        xpGained,
        description,
        metadata: metadata ?? null,
      })
      .returning();

    // Update the stat
    const [currentStat] = await db
      .select()
      .from(stats)
      .where(and(eq(stats.memberId, memberId), eq(stats.statType, statAffected)));

    let updatedStat;

    if (currentStat) {
      const newXp = currentStat.currentXp + xpGained;
      const newLevel = getLevelFromXp(newXp);

      [updatedStat] = await db
        .update(stats)
        .set({
          currentXp: newXp,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(stats.id, currentStat.id))
        .returning();
    } else {
      // Initialize stat if doesn't exist
      const newLevel = getLevelFromXp(xpGained);
      [updatedStat] = await db
        .insert(stats)
        .values({
          memberId,
          statType: statAffected,
          currentXp: xpGained,
          level: newLevel,
        })
        .returning();
    }

    // Update streak and check for comebacks
    const isComeback = await updateStreak(memberId, activityType === "bounce_back");

    // If this activity triggered a comeback (and isn't already a bounce_back activity),
    // log a bonus bounce_back activity to grant the comeback XP
    if (isComeback && activityType !== "bounce_back") {
      const bounceBackXp = XP_VALUES.bounce_back.base;

      // Log bounce_back activity
      await db.insert(activityLog).values({
        memberId,
        activityType: "bounce_back",
        statAffected: "grit",
        xpGained: bounceBackXp,
        description: "Bounced back after a break!",
        metadata: { triggeredBy: activityType },
      });

      // Update grit stat
      const [gritStat] = await db
        .select()
        .from(stats)
        .where(and(eq(stats.memberId, memberId), eq(stats.statType, "grit")));

      if (gritStat) {
        const newXp = gritStat.currentXp + bounceBackXp;
        await db
          .update(stats)
          .set({ currentXp: newXp, level: getLevelFromXp(newXp), updatedAt: new Date() })
          .where(eq(stats.id, gritStat.id));
      } else {
        await db.insert(stats).values({
          memberId,
          statType: "grit",
          currentXp: bounceBackXp,
          level: getLevelFromXp(bounceBackXp),
        });
      }
    }

    return NextResponse.json({
      activity,
      stat: updatedStat,
      xpGained,
      message: `+${xpGained} ${statAffected.toUpperCase()} XP`,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}

// Helper: Update streak tracking
// Returns true if this activity is a comeback (streak was broken)
async function updateStreak(memberId: string, isBounceBack: boolean): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let [memberStreak] = await db
    .select()
    .from(streaks)
    .where(eq(streaks.memberId, memberId));

  if (!memberStreak) {
    // Initialize streak - first activity is never a comeback
    await db.insert(streaks).values({
      memberId,
      currentStreak: 1,
      bestStreak: 1,
      comebackCount: isBounceBack ? 1 : 0,
      lastActiveDate: today,
      weekStartDate: getWeekStart(today),
    });
    return false;
  }

  const lastActive = memberStreak.lastActiveDate
    ? new Date(memberStreak.lastActiveDate)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  // Already active today - not a new comeback
  if (lastActive && lastActive.getTime() === today.getTime()) {
    return false;
  }

  // Calculate days since last activity
  const daysSinceActive = lastActive
    ? Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let newCurrentStreak = memberStreak.currentStreak;
  let newBestStreak = memberStreak.bestStreak;
  let newComebackCount = memberStreak.comebackCount;
  let isComeback = false;

  if (daysSinceActive === 1) {
    // Consecutive day
    newCurrentStreak++;
  } else if (daysSinceActive <= 3) {
    // Within rest day allowance (up to 2 rest days)
    newCurrentStreak++;
  } else {
    // Streak broken, this is a comeback
    newCurrentStreak = 1;
    newComebackCount++;
    isComeback = true;
  }

  if (newCurrentStreak > newBestStreak) {
    newBestStreak = newCurrentStreak;
  }

  // Reset weekly rest days if new week
  const weekStart = getWeekStart(today);
  const lastWeekStart = memberStreak.weekStartDate
    ? new Date(memberStreak.weekStartDate)
    : null;

  const isNewWeek =
    !lastWeekStart || weekStart.getTime() !== lastWeekStart.getTime();

  await db
    .update(streaks)
    .set({
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      comebackCount: newComebackCount,
      lastActiveDate: today,
      restDaysUsedThisWeek: isNewWeek ? 0 : memberStreak.restDaysUsedThisWeek,
      weekStartDate: weekStart,
      updatedAt: new Date(),
    })
    .where(eq(streaks.id, memberStreak.id));

  return isComeback;
}

// Helper: Get start of current week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
