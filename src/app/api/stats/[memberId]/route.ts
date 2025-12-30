import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stats, streaks, members, activityLog } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { STAT_TYPES, getLevelFromXp, getOverallLevel, StatType, STAT_INFO } from "@/lib/stats";

// GET stats for a member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;

    // Verify member exists
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get all stats for member
    let memberStats = await db
      .select()
      .from(stats)
      .where(eq(stats.memberId, memberId));

    // If no stats exist, initialize them
    if (memberStats.length === 0) {
      const initialStats = STAT_TYPES.map(statType => ({
        memberId,
        statType,
        currentXp: 0,
        level: 1,
      }));

      memberStats = await db
        .insert(stats)
        .values(initialStats)
        .returning();
    }

    // Get streak data
    let [memberStreak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.memberId, memberId));

    // Initialize streak if doesn't exist
    if (!memberStreak) {
      [memberStreak] = await db
        .insert(streaks)
        .values({
          memberId,
          currentStreak: 0,
          bestStreak: 0,
          comebackCount: 0,
          restDaysUsedThisWeek: 0,
        })
        .returning();
    }

    // Get today's check-in (latest one for today)
    const [todayCheckIn] = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.memberId, memberId),
          eq(activityLog.activityType, "check_in"),
          sql`DATE(${activityLog.createdAt}) = CURRENT_DATE`
        )
      )
      .orderBy(desc(activityLog.createdAt))
      .limit(1);

    // Format response
    const statsMap: Record<StatType, {
      statType: StatType;
      currentXp: number;
      level: number;
      info: typeof STAT_INFO[StatType];
    }> = {} as any;

    for (const stat of memberStats) {
      const statType = stat.statType as StatType;
      statsMap[statType] = {
        statType,
        currentXp: stat.currentXp,
        level: getLevelFromXp(stat.currentXp),
        info: STAT_INFO[statType],
      };
    }

    const statLevels = Object.values(statsMap).map(s => s.level);
    const totalXp = Object.values(statsMap).reduce((sum, s) => sum + s.currentXp, 0);

    return NextResponse.json({
      memberId,
      memberName: member.name,
      stats: statsMap,
      overallLevel: getOverallLevel(statLevels),
      totalXp,
      streak: {
        current: memberStreak.currentStreak,
        best: memberStreak.bestStreak,
        comebacks: memberStreak.comebackCount,
        lastActiveDate: memberStreak.lastActiveDate,
      },
      todayCheckIn: todayCheckIn
        ? {
            id: todayCheckIn.id,
            mood: (todayCheckIn.metadata as { mood?: number })?.mood,
            description: todayCheckIn.description,
            xpGained: todayCheckIn.xpGained,
            createdAt: todayCheckIn.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
