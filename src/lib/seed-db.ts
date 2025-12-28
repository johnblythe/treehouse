// Database seed utilities - run via API
// Usage: import { seedFamilyDB } from "@/lib/seed-db" then call in browser console or component

const API_BASE = "";

export const SEED_FAMILY = [
  { name: "john", avatar: "🤓", color: "red", role: "parent" },
  { name: "lo", avatar: "🦊", color: "yellow", role: "parent" },
  { name: "q", avatar: "😎", color: "blue", role: "child" },
  { name: "arya", avatar: "🦄", color: "pink", role: "child" },
  { name: "teetah", avatar: "⚽", color: "green", role: "child" },
];

const SAMPLE_ACTIVITIES = [
  "Made bed",
  "Brushed teeth",
  "Did homework",
  "Fed the pet",
  "Cleaned room",
  "Set the table",
  "Took out trash",
  "Did dishes",
  "Folded laundry",
  "Read for 20 min",
];

export async function seedFamilyDB(): Promise<{ members: Array<{ id: string; name: string }> }> {
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
      console.error(`  ✗ Failed to create ${member.name}`);
    }
  }

  console.log(`🌱 Seeded ${members.length} members`);
  return { members };
}

export async function seedActivitiesDB(memberIds: string[]): Promise<void> {
  if (memberIds.length === 0) {
    console.error("No member IDs provided");
    return;
  }

  console.log("🌱 Seeding activities...");
  const count = 15 + Math.floor(Math.random() * 6);

  for (let i = 0; i < count; i++) {
    const memberId = memberIds[Math.floor(Math.random() * memberIds.length)];
    const activityName = SAMPLE_ACTIVITIES[Math.floor(Math.random() * SAMPLE_ACTIVITIES.length)];
    const points = [5, 10, 15, 20][Math.floor(Math.random() * 4)];

    // Use the points endpoint which also logs the activity
    const res = await fetch(`${API_BASE}/api/members/${memberId}/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points,
        activityType: "chore",
        activityName,
      }),
    });

    if (res.ok) {
      console.log(`  ✓ ${activityName} (+${points})`);
    }
  }

  console.log(`🌱 Seeded ${count} activities`);
}

export async function clearFamilyDB(): Promise<void> {
  console.log("🧹 Clearing family data...");

  const res = await fetch(`${API_BASE}/api/members`);
  if (!res.ok) return;

  const members = await res.json();
  for (const member of members) {
    await fetch(`${API_BASE}/api/members?id=${member.id}`, { method: "DELETE" });
    console.log(`  ✓ Deleted ${member.name}`);
  }

  console.log("🧹 Cleared all members (cascade deletes activities)");
}

// Full seed: clear + seed family + seed activities
export async function seedAllDB(): Promise<void> {
  await clearFamilyDB();
  const { members } = await seedFamilyDB();
  await seedActivitiesDB(members.map((m) => m.id));
  console.log("✅ Database seeded! Refresh the page.");
}
