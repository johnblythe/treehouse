import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET items (optionally filtered by type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'chore' | 'checklist_item' | 'dinner_option'
    const id = searchParams.get("id");

    if (id) {
      const [item] = await db.select().from(items).where(eq(items.id, id));
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      return NextResponse.json(item);
    }

    let query = db.select().from(items);
    if (type) {
      query = query.where(eq(items.type, type)) as typeof query;
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, emoji, points, difficulty, isDecoy, metadata } = body;

    if (!type || !name) {
      return NextResponse.json({ error: "type and name required" }, { status: 400 });
    }

    const [newItem] = await db
      .insert(items)
      .values({
        type,
        name,
        emoji: emoji || null,
        points: points ?? 1,
        difficulty: difficulty || null,
        isDecoy: isDecoy || false,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

// PATCH update item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const [updated] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.delete(items).where(eq(items.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
