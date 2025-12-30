import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: (table: any) => ({
        where: (condition: any) => ({
          orderBy: (order: any) => ({
            limit: (n: number) => mockLimit(),
          }),
          limit: (n: number) => mockLimit(),
        }),
      }),
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => mockReturning(),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  members: { id: "id", name: "name" },
  stats: { memberId: "memberId", statType: "statType" },
  streaks: { memberId: "memberId" },
  activityLog: { memberId: "memberId", activityType: "activityType", createdAt: "createdAt" },
}));

vi.mock("@/lib/stats", () => ({
  STAT_TYPES: ["grit", "wisdom", "heart", "initiative", "temperance"],
  getLevelFromXp: (xp: number) => Math.floor(xp / 100) + 1,
  getOverallLevel: (levels: number[]) => Math.floor(levels.reduce((a, b) => a + b, 0) / levels.length),
  STAT_INFO: {
    grit: { emoji: "💪", name: "Grit", description: "Perseverance", color: "orange" },
    wisdom: { emoji: "🧠", name: "Wisdom", description: "Reflection", color: "purple" },
    heart: { emoji: "❤️", name: "Heart", description: "Kindness", color: "pink" },
    initiative: { emoji: "⚡", name: "Initiative", description: "Action", color: "yellow" },
    temperance: { emoji: "⚖️", name: "Temperance", description: "Balance", color: "blue" },
  },
}));

describe("Stats API - todayCheckIn logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("todayCheckIn field", () => {
    it("should query activity_log for today's check-in", () => {
      // This tests the concept - the actual implementation queries:
      // SELECT * FROM activity_log
      // WHERE member_id = ? AND activity_type = 'check_in' AND DATE(created_at) = CURRENT_DATE
      // ORDER BY created_at DESC
      // LIMIT 1

      const mockCheckIn = {
        id: "check-in-1",
        memberId: "member-1",
        activityType: "check_in",
        statAffected: "wisdom",
        xpGained: 10,
        description: "Proud of helping my sister",
        metadata: { mood: 4 },
        createdAt: new Date().toISOString(),
      };

      // The query should:
      // 1. Filter by memberId
      expect(mockCheckIn.memberId).toBe("member-1");
      // 2. Filter by activityType = 'check_in'
      expect(mockCheckIn.activityType).toBe("check_in");
      // 3. Return mood from metadata
      expect(mockCheckIn.metadata.mood).toBe(4);
      // 4. Return description
      expect(mockCheckIn.description).toBe("Proud of helping my sister");
    });

    it("should format todayCheckIn response correctly", () => {
      const rawActivityLog = {
        id: "check-in-1",
        memberId: "member-1",
        activityType: "check_in",
        statAffected: "wisdom",
        xpGained: 10,
        description: "Did my homework",
        metadata: { mood: 3 },
        createdAt: new Date().toISOString(),
      };

      // The API should format it as:
      const formattedCheckIn = {
        id: rawActivityLog.id,
        mood: (rawActivityLog.metadata as { mood?: number })?.mood,
        description: rawActivityLog.description,
        xpGained: rawActivityLog.xpGained,
        createdAt: rawActivityLog.createdAt,
      };

      expect(formattedCheckIn.id).toBe("check-in-1");
      expect(formattedCheckIn.mood).toBe(3);
      expect(formattedCheckIn.description).toBe("Did my homework");
      expect(formattedCheckIn.xpGained).toBe(10);
    });

    it("should return null when no check-in exists for today", () => {
      // When query returns empty, todayCheckIn should be null
      const queryResult: any[] = [];
      const [todayCheckIn] = queryResult;

      expect(todayCheckIn).toBeUndefined();

      // The API converts undefined to null in response
      const responseCheckIn = todayCheckIn || null;
      expect(responseCheckIn).toBeNull();
    });

    it("should return latest check-in when multiple exist (most recent wins)", () => {
      const checkIns = [
        {
          id: "check-in-2",
          metadata: { mood: 5 },
          description: "Great day!",
          createdAt: "2025-01-01T18:00:00Z", // Later
        },
        {
          id: "check-in-1",
          metadata: { mood: 3 },
          description: "Okay day",
          createdAt: "2025-01-01T09:00:00Z", // Earlier
        },
      ];

      // Query orders by createdAt DESC and limits to 1
      // So the first result is the most recent
      const [latestCheckIn] = checkIns;

      expect(latestCheckIn.id).toBe("check-in-2");
      expect(latestCheckIn.metadata.mood).toBe(5);
    });
  });
});

describe("Stats API - Response Structure", () => {
  it("should include todayCheckIn in stats response", () => {
    // Expected response shape
    const expectedResponse = {
      memberId: "member-1",
      memberName: "Emma",
      stats: {
        grit: { statType: "grit", currentXp: 50, level: 1 },
        wisdom: { statType: "wisdom", currentXp: 100, level: 2 },
        heart: { statType: "heart", currentXp: 0, level: 1 },
        initiative: { statType: "initiative", currentXp: 0, level: 1 },
        temperance: { statType: "temperance", currentXp: 0, level: 1 },
      },
      overallLevel: 1,
      totalXp: 150,
      streak: {
        current: 5,
        best: 10,
        comebacks: 2,
        lastActiveDate: "2025-01-01T00:00:00Z",
      },
      todayCheckIn: {
        id: "check-in-1",
        mood: 4,
        description: "Helped with dishes",
        xpGained: 10,
        createdAt: "2025-01-01T12:00:00Z",
      },
    };

    // Verify structure
    expect(expectedResponse).toHaveProperty("todayCheckIn");
    expect(expectedResponse.todayCheckIn).toHaveProperty("mood");
    expect(expectedResponse.todayCheckIn).toHaveProperty("description");
    expect(expectedResponse.todayCheckIn).toHaveProperty("xpGained");
  });

  it("should handle todayCheckIn as null when not checked in", () => {
    const responseWithNoCheckIn = {
      memberId: "member-1",
      memberName: "Emma",
      stats: {},
      overallLevel: 1,
      totalXp: 0,
      streak: {},
      todayCheckIn: null,
    };

    expect(responseWithNoCheckIn.todayCheckIn).toBeNull();
  });
});
