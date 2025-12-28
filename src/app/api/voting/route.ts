import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { votingSessions, votes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET voting sessions (optionally filter by status)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      const [session] = await db
        .select()
        .from(votingSessions)
        .where(eq(votingSessions.id, id));
      
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Get votes for this session
      const sessionVotes = await db
        .select()
        .from(votes)
        .where(eq(votes.sessionId, id));

      return NextResponse.json({ ...session, votes: sessionVotes });
    }

    let query = db
      .select()
      .from(votingSessions)
      .orderBy(desc(votingSessions.createdAt))
      .limit(20);

    if (status) {
      query = query.where(eq(votingSessions.status, status)) as typeof query;
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch voting sessions:", error);
    return NextResponse.json({ error: "Failed to fetch voting sessions" }, { status: 500 });
  }
}

// POST create new voting session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, options, config } = body;

    if (!type || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: "type and options array required" },
        { status: 400 }
      );
    }

    const [session] = await db
      .insert(votingSessions)
      .values({
        type,
        options,
        config: config || {},
        status: "active",
      })
      .returning();

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create voting session:", error);
    return NextResponse.json({ error: "Failed to create voting session" }, { status: 500 });
  }
}

// PATCH update voting session (e.g., complete it)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, result } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (result) updates.result = result;
    if (status === "completed") updates.completedAt = new Date();

    const [updated] = await db
      .update(votingSessions)
      .set(updates)
      .where(eq(votingSessions.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update voting session:", error);
    return NextResponse.json({ error: "Failed to update voting session" }, { status: 500 });
  }
}
