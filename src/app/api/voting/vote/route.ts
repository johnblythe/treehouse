import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { votes, votingSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST cast a vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, memberId, optionId, value, round, metadata } = body;

    if (!sessionId || !memberId || !optionId) {
      return NextResponse.json(
        { error: "sessionId, memberId, and optionId required" },
        { status: 400 }
      );
    }

    // Verify session exists and is active
    const [session] = await db
      .select()
      .from(votingSessions)
      .where(eq(votingSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json({ error: "Session is not active" }, { status: 400 });
    }

    // Check for existing vote (for swipe, prevent double-voting on same option)
    const existing = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.sessionId, sessionId),
          eq(votes.memberId, memberId),
          eq(votes.optionId, optionId),
          round !== undefined ? eq(votes.round, round) : undefined
        )
      );

    if (existing.length > 0 && session.type === "swipe") {
      return NextResponse.json({ error: "Already voted on this option" }, { status: 400 });
    }

    const [vote] = await db
      .insert(votes)
      .values({
        sessionId,
        memberId,
        optionId,
        value,
        round,
        metadata,
      })
      .returning();

    // Get updated vote counts
    const allVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.sessionId, sessionId));

    return NextResponse.json({ vote, totalVotes: allVotes.length, allVotes });
  } catch (error) {
    console.error("Failed to cast vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}

// GET votes for a session (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const memberId = searchParams.get("memberId");
    const round = searchParams.get("round");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    let conditions = [eq(votes.sessionId, sessionId)];
    if (memberId) conditions.push(eq(votes.memberId, memberId));
    if (round) conditions.push(eq(votes.round, parseInt(round)));

    const result = await db
      .select()
      .from(votes)
      .where(and(...conditions));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch votes:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}
