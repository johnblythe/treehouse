import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// GET activities (optionally filtered by memberId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = db.select().from(activities).orderBy(desc(activities.completedAt)).limit(limit);

    if (memberId) {
      query = query.where(eq(activities.memberId, memberId)) as typeof query;
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

// POST create activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, type, name, points, metadata } = body;

    if (!memberId || !type || !name) {
      return NextResponse.json(
        { error: "memberId, type, and name are required" },
        { status: 400 }
      );
    }

    const [newActivity] = await db
      .insert(activities)
      .values({
        memberId,
        type,
        name,
        points: points || 0,
        metadata,
      })
      .returning();

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
