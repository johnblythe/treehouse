import { Member } from "./types";

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
