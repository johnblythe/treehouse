import { Member, Activity } from "./types";

// Test family data - use for development/testing
export const SEED_FAMILY: Member[] = [
  {
    id: "seed-john",
    name: "john",
    avatar: "🤓",
    color: "red",
    role: "parent",
    points: 0,
    createdAt: "2024-12-26T00:00:00.000Z",
  },
  {
    id: "seed-lo",
    name: "lo",
    avatar: "🦊",
    color: "yellow",
    role: "parent",
    points: 0,
    createdAt: "2024-12-26T00:00:00.000Z",
  },
  {
    id: "seed-q",
    name: "q",
    avatar: "😎",
    color: "blue",
    role: "child",
    points: 0,
    createdAt: "2024-12-26T00:00:00.000Z",
  },
  {
    id: "seed-arya",
    name: "arya",
    avatar: "🦄",
    color: "pink",
    role: "child",
    points: 0,
    createdAt: "2024-12-26T00:00:00.000Z",
  },
  {
    id: "seed-teetah",
    name: "teetah",
    avatar: "⚽",
    color: "green",
    role: "child",
    points: 0,
    createdAt: "2024-12-26T00:00:00.000Z",
  },
];

// Helper to seed localStorage (run in browser console or dev tools)
export function seedFamily() {
  if (typeof window !== "undefined") {
    localStorage.setItem("treehouse:family-members", JSON.stringify(SEED_FAMILY));
    window.location.reload();
  }
}

// Helper to clear family data
export function clearFamily() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("treehouse:family-members");
    window.location.reload();
  }
}

// Sample activities for testing
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

// Seed activities with random data
export function seedActivities(members: Member[]) {
  if (typeof window === "undefined" || members.length === 0) return;

  const activities: Activity[] = [];
  const now = Date.now();

  // Generate 15-20 random activities
  const count = 15 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < count; i++) {
    const member = members[Math.floor(Math.random() * members.length)];
    const activityName = SAMPLE_ACTIVITIES[Math.floor(Math.random() * SAMPLE_ACTIVITIES.length)];
    const points = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
    
    // Spread activities over past few hours
    const timeAgo = Math.floor(Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours ago
    
    activities.push({
      id: `seed-activity-${i}`,
      memberId: member.id,
      type: "chore",
      name: activityName,
      points,
      completedAt: new Date(now - timeAgo).toISOString(),
    });
  }

  // Sort by time (most recent first)
  activities.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Also update member points to match
  const pointsByMember: Record<string, number> = {};
  activities.forEach(a => {
    pointsByMember[a.memberId] = (pointsByMember[a.memberId] || 0) + a.points;
  });

  const updatedMembers = members.map(m => ({
    ...m,
    points: pointsByMember[m.id] || 0,
  }));

  localStorage.setItem("treehouse:activities", JSON.stringify(activities));
  localStorage.setItem("treehouse:family-members", JSON.stringify(updatedMembers));
  window.location.reload();
}

// Clear activities
export function clearActivities() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("treehouse:activities");
  }
}
