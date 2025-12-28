import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members, activities } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// POST award points to a member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { points, activityType, activityName, metadata } = body;

    if (typeof points !== "number") {
      return NextResponse.json({ error: "points must be a number" }, { status: 400 });
    }

    // Update member points
    const [updated] = await db
      .update(members)
      .set({
        points: sql`${members.points} + ${points}`,
      })
      .where(eq(members.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Log the activity if type provided
    if (activityType && activityName) {
      await db.insert(activities).values({
        memberId: id,
        type: activityType,
        name: activityName,
        points,
        metadata,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to award points:", error);
    return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
  }
}
