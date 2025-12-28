// Direct DB seed - run with: npx tsx scripts/seed-direct.ts
// No dev server needed - connects directly to Supabase

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { members, activities, items } from "../src/db/schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54342/postgres";
const client = postgres(connectionString);
const db = drizzle(client);

const SEED_FAMILY = [
  { name: "john", avatar: "🤓", color: "red", role: "parent" as const },
  { name: "lo", avatar: "🦊", color: "yellow", role: "parent" as const },
  { name: "q", avatar: "😎", color: "blue", role: "child" as const },
  { name: "arya", avatar: "🦄", color: "pink", role: "child" as const },
  { name: "teetah", avatar: "⚽", color: "green", role: "child" as const },
];

const SAMPLE_ACTIVITIES = [
  "Made bed", "Brushed teeth", "Did homework", "Fed the pet", "Cleaned room",
  "Set the table", "Took out trash", "Did dishes", "Folded laundry", "Read for 20 min",
];

const SEED_CHORES = [
  { name: "Make bed", emoji: "🛏️", points: 5, difficulty: "easy" as const },
  { name: "Brush teeth", emoji: "🦷", points: 5, difficulty: "easy" as const },
  { name: "Clean room", emoji: "🧹", points: 15, difficulty: "medium" as const },
  { name: "Do homework", emoji: "📚", points: 20, difficulty: "hard" as const },
  { name: "Feed pet", emoji: "🐕", points: 10, difficulty: "easy" as const },
  { name: "Set table", emoji: "🍽️", points: 5, difficulty: "easy" as const },
  { name: "Take out trash", emoji: "🗑️", points: 10, difficulty: "medium" as const },
  { name: "Do dishes", emoji: "🍳", points: 15, difficulty: "medium" as const },
  { name: "Fold laundry", emoji: "👕", points: 15, difficulty: "medium" as const },
  { name: "Read 20 min", emoji: "📖", points: 10, difficulty: "easy" as const },
];

const SEED_DINNERS = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Tacos", emoji: "🌮" },
  { name: "Pasta", emoji: "🍝" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Chicken", emoji: "🍗" },
  { name: "Stir Fry", emoji: "🥘" },
  { name: "Sandwiches", emoji: "🥪" },
  { name: "Soup", emoji: "🍲" },
  { name: "Salad", emoji: "🥗" },
];

async function main() {
  console.log("🧹 Clearing existing data...");
  await db.delete(activities);
  await db.delete(items);
  await db.delete(members);

  console.log("🌱 Seeding family members...");
  const inserted = await db.insert(members).values(
    SEED_FAMILY.map((m) => ({ ...m, points: 0 }))
  ).returning();

  for (const m of inserted) {
    console.log(`  ✓ Created ${m.name} (${m.id})`);
  }

  console.log("🌱 Seeding activities...");
  const count = 15 + Math.floor(Math.random() * 6);
  const activityRecords = [];
  const pointsByMember: Record<string, number> = {};

  for (let i = 0; i < count; i++) {
    const member = inserted[Math.floor(Math.random() * inserted.length)];
    const activityName = SAMPLE_ACTIVITIES[Math.floor(Math.random() * SAMPLE_ACTIVITIES.length)];
    const points = [5, 10, 15, 20][Math.floor(Math.random() * 4)];

    activityRecords.push({
      memberId: member.id,
      type: "chore",
      name: activityName,
      points,
    });

    pointsByMember[member.id] = (pointsByMember[member.id] || 0) + points;
    console.log(`  ✓ ${member.name}: ${activityName} (+${points})`);
  }

  await db.insert(activities).values(activityRecords);

  // Update member points
  console.log("📊 Updating member points...");
  for (const [memberId, pts] of Object.entries(pointsByMember)) {
    await db.update(members).set({ points: pts }).where(eq(members.id, memberId));
  }

  // Seed chores
  console.log("🧹 Seeding chores...");
  await db.insert(items).values(
    SEED_CHORES.map((c) => ({ ...c, type: "chore" as const }))
  );
  console.log(`  ✓ Added ${SEED_CHORES.length} chores`);

  // Seed dinner options
  console.log("🍽️ Seeding dinner options...");
  await db.insert(items).values(
    SEED_DINNERS.map((d) => ({ ...d, type: "dinner_option" as const, points: 0 }))
  );
  console.log(`  ✓ Added ${SEED_DINNERS.length} dinner options`);

  // Verify
  const finalMembers = await db.select().from(members);
  console.log("\n📊 Final standings:");
  finalMembers
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .forEach((m, i) => console.log(`  ${i + 1}. ${m.name}: ${m.points} pts`));

  const allItems = await db.select().from(items);
  console.log(`\n📦 Items: ${allItems.filter(i => i.type === 'chore').length} chores, ${allItems.filter(i => i.type === 'dinner_option').length} dinners`);

  await client.end();
  console.log("\n✅ Done!");
}

main().catch(console.error);
