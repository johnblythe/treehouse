// Seed script - run with: npx tsx scripts/seed.ts
import "dotenv/config";

const API_BASE = "http://localhost:3002";

const SEED_FAMILY = [
  { name: "john", avatar: "🤓", color: "red", role: "parent" },
  { name: "lo", avatar: "🦊", color: "yellow", role: "parent" },
  { name: "q", avatar: "😎", color: "blue", role: "child" },
  { name: "arya", avatar: "🦄", color: "pink", role: "child" },
  { name: "teetah", avatar: "⚽", color: "green", role: "child" },
];

const SAMPLE_ACTIVITIES = [
  "Made bed", "Brushed teeth", "Did homework", "Fed the pet", "Cleaned room",
  "Set the table", "Took out trash", "Did dishes", "Folded laundry", "Read for 20 min",
];

async function seedFamily() {
  console.log("🌱 Seeding family members...");
  const members: Array<{ id: string; name: string }> = [];

  for (const member of SEED_FAMILY) {
    const res = await fetch(`${API_BASE}/api/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    if (res.ok) {
      const created = await res.json();
      members.push({ id: created.id, name: created.name });
      console.log(`  ✓ Created ${created.name}`);
    } else {
      const err = await res.text();
      console.error(`  ✗ Failed: ${member.name} - ${err}`);
    }
  }
  return members;
}

async function seedActivities(memberIds: string[]) {
  console.log("🌱 Seeding activities...");
  const count = 15 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    const memberId = memberIds[Math.floor(Math.random() * memberIds.length)];
    const activityName = SAMPLE_ACTIVITIES[Math.floor(Math.random() * SAMPLE_ACTIVITIES.length)];
    const points = [5, 10, 15, 20][Math.floor(Math.random() * 4)];

    const res = await fetch(`${API_BASE}/api/members/${memberId}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points, activityType: "chore", activityName }),
    });

    if (res.ok) console.log(`  ✓ ${activityName} (+${points})`);
  }
}

async function clearFamily() {
  console.log("🧹 Clearing existing data...");
  const res = await fetch(`${API_BASE}/api/members`);
  if (!res.ok) return;

  const members = await res.json();
  for (const m of members) {
    await fetch(`${API_BASE}/api/members?id=${m.id}`, { method: "DELETE" });
    console.log(`  ✓ Deleted ${m.name}`);
  }
}

async function main() {
  try {
    await clearFamily();
    const members = await seedFamily();
    if (members.length > 0) {
      await seedActivities(members.map((m) => m.id));
    }
    console.log("✅ Done!");
  } catch (err) {
    console.error("❌ Error:", err);
    console.log("\nMake sure the dev server is running: npm run dev");
  }
}

main();
