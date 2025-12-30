import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLog, members } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { STAT_INFO, StatType } from "@/lib/stats";

// GET recent activity history for a member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");

    // Verify member exists
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get recent activities
    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.memberId, memberId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);

    // Format with stat info
    const formattedActivities = activities.map(activity => {
      const statType = activity.statAffected as StatType;
      const statInfo = STAT_INFO[statType];

      return {
        id: activity.id,
        activityType: activity.activityType,
        statAffected: activity.statAffected,
        statEmoji: statInfo?.emoji ?? "📊",
        statName: statInfo?.name ?? activity.statAffected,
        xpGained: activity.xpGained,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        // Formatted display string
        displayText: formatActivityDisplay(activity, statInfo),
      };
    });

    return NextResponse.json({
      memberId,
      memberName: member.name,
      activities: formattedActivities,
      count: formattedActivities.length,
    });
  } catch (error) {
    console.error("Failed to fetch activity history:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity history" },
      { status: 500 }
    );
  }
}

// Helper: Format activity for display
function formatActivityDisplay(
  activity: {
    activityType: string;
    xpGained: number;
    description: string | null;
    metadata: unknown;
  },
  statInfo: typeof STAT_INFO[StatType] | undefined
): string {
  const emoji = statInfo?.emoji ?? "📊";
  const xp = activity.xpGained;

  switch (activity.activityType) {
    case "self_report":
      return activity.description
        ? `+${xp} ${emoji} ${activity.description}`
        : `+${xp} ${emoji} Self-reported activity`;
    case "check_in":
      return `+${xp} ${emoji} Daily check-in`;
    case "micro_app":
      const app = (activity.metadata as { app?: string })?.app ?? "activity";
      const appName = app === "chore_spinner" ? "Chore Spinner" :
                     app === "dinner_picker" ? "Dinner Picker" : app;
      return `+${xp} ${emoji} ${appName}`;
    case "bounce_back":
      return `+${xp} ${emoji} Welcome back! Returned after a break`;
    default:
      return `+${xp} ${emoji} Activity`;
  }
}
