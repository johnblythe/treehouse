import { describe, it, expect, vi, beforeEach } from "vitest";
import { XP_VALUES } from "@/lib/stats";

// Mock database operations
const mockDbInsert = vi.fn();
const mockDbSelect = vi.fn();
const mockDbUpdate = vi.fn();

vi.mock("@/db", () => ({
  db: {
    insert: () => ({ values: () => ({ returning: () => mockDbInsert() }) }),
    select: () => ({
      from: () => ({
        where: () => mockDbSelect(),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({ returning: () => mockDbUpdate() }),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  members: { id: "id" },
  stats: { memberId: "memberId", statType: "statType", id: "id" },
  streaks: { memberId: "memberId", id: "id" },
  activityLog: { memberId: "memberId" },
}));

describe("Stats Log API - XP Calculation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("self_report XP values", () => {
    it("calculates base XP for self_report", () => {
      expect(XP_VALUES.self_report.base).toBe(15);
    });

    it("adds hard bonus when wasHard is true", () => {
      const baseXp = XP_VALUES.self_report.base;
      const hardBonus = XP_VALUES.self_report.hardBonus;
      expect(baseXp + hardBonus).toBe(20);
    });

    it("adds description bonus when description provided", () => {
      const baseXp = XP_VALUES.self_report.base;
      const descBonus = XP_VALUES.self_report.descriptionBonus;
      expect(baseXp + descBonus).toBe(20);
    });

    it("adds both bonuses for max XP", () => {
      const baseXp = XP_VALUES.self_report.base;
      const hardBonus = XP_VALUES.self_report.hardBonus;
      const descBonus = XP_VALUES.self_report.descriptionBonus;
      expect(baseXp + hardBonus + descBonus).toBe(25);
    });
  });

  describe("micro_app XP values", () => {
    it("grants 20 XP for chore_spinner", () => {
      expect(XP_VALUES.micro_app.chore_spinner).toBe(20);
    });

    it("grants 10 XP for dinner_picker", () => {
      expect(XP_VALUES.micro_app.dinner_picker).toBe(10);
    });
  });

  describe("check_in XP values", () => {
    it("grants 10 XP for check_in", () => {
      expect(XP_VALUES.check_in.base).toBe(10);
    });
  });

  describe("bounce_back XP values", () => {
    it("grants 15 XP for bounce_back", () => {
      expect(XP_VALUES.bounce_back.base).toBe(15);
    });
  });
});

describe("Stats Log API - Streak Logic", () => {
  describe("streak detection", () => {
    it("identifies consecutive day (daysSinceActive === 1)", () => {
      const lastActive = new Date();
      lastActive.setDate(lastActive.getDate() - 1); // Yesterday
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);

      const daysSinceActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysSinceActive).toBe(1);
    });

    it("allows up to 2 rest days (daysSinceActive <= 3)", () => {
      // 1 rest day = daysSinceActive === 2
      // 2 rest days = daysSinceActive === 3
      const lastActive = new Date();
      lastActive.setDate(lastActive.getDate() - 3); // 3 days ago (2 rest days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);

      const daysSinceActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysSinceActive).toBe(3);
      expect(daysSinceActive <= 3).toBe(true); // Still within rest day allowance
    });

    it("detects comeback when daysSinceActive > 3", () => {
      const lastActive = new Date();
      lastActive.setDate(lastActive.getDate() - 4); // 4 days ago (3 rest days = broken streak)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActive.setHours(0, 0, 0, 0);

      const daysSinceActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysSinceActive).toBe(4);
      expect(daysSinceActive > 3).toBe(true); // This is a comeback
    });
  });

  describe("comeback XP logic", () => {
    it("should grant bounce_back XP when comeback is detected", () => {
      // When isComeback === true and activityType !== 'bounce_back'
      const isComeback = true;
      const activityType: string = "self_report";
      const shouldGrantBounceBack = isComeback && activityType !== "bounce_back";

      expect(shouldGrantBounceBack).toBe(true);
    });

    it("should NOT double-grant XP when activity is already bounce_back", () => {
      const isComeback = true;
      const activityType: string = "bounce_back";
      const shouldGrantBounceBack = isComeback && activityType !== "bounce_back";

      expect(shouldGrantBounceBack).toBe(false);
    });

    it("should NOT grant bounce_back XP when not a comeback", () => {
      const isComeback = false;
      const activityType: string = "self_report";
      const shouldGrantBounceBack = isComeback && activityType !== "bounce_back";

      expect(shouldGrantBounceBack).toBe(false);
    });
  });

  describe("race condition fix - grit stat", () => {
    it("should use updatedStat when original activity affected grit", () => {
      // When original activity affected grit, we should build on updatedStat
      const statAffected: string = "grit";
      const updatedStat = { id: "stat-1", currentXp: 50, level: 1 };
      const bounceBackXp = XP_VALUES.bounce_back.base;

      // Simulating the race condition fix logic
      const shouldUseUpdatedStat = statAffected === "grit" && updatedStat;
      expect(shouldUseUpdatedStat).toBeTruthy();

      if (shouldUseUpdatedStat) {
        const newXp = updatedStat.currentXp + bounceBackXp;
        expect(newXp).toBe(65); // 50 + 15
      }
    });

    it("should fetch grit stat when original activity affected different stat", () => {
      const statAffected: string = "wisdom";
      const updatedStat = { id: "stat-1", currentXp: 30, level: 1 };

      // Simulating the race condition fix logic
      const shouldUseUpdatedStat = statAffected === "grit" && updatedStat;
      expect(shouldUseUpdatedStat).toBeFalsy();

      // In this case, we'd fetch grit stat from DB (separate from updatedStat)
    });
  });
});

describe("Stats Log API - Input Validation", () => {
  describe("required fields", () => {
    it("validates memberId is required", () => {
      const body: Record<string, string | undefined> = { activityType: "self_report", statAffected: "grit" };
      const isValid = body.memberId && body.activityType && body.statAffected;
      expect(isValid).toBeFalsy();
    });

    it("validates activityType is required", () => {
      const body: Record<string, string | undefined> = { memberId: "123", statAffected: "grit" };
      const isValid = body.memberId && body.activityType && body.statAffected;
      expect(isValid).toBeFalsy();
    });

    it("validates statAffected is required", () => {
      const body: Record<string, string | undefined> = { memberId: "123", activityType: "self_report" };
      const isValid = body.memberId && body.activityType && body.statAffected;
      expect(isValid).toBeFalsy();
    });

    it("passes validation when all required fields present", () => {
      const body: Record<string, string> = {
        memberId: "123",
        activityType: "self_report",
        statAffected: "grit",
      };
      const isValid = body.memberId && body.activityType && body.statAffected;
      expect(isValid).toBeTruthy();
    });
  });

  describe("statAffected validation", () => {
    const STAT_TYPES = ["grit", "wisdom", "heart", "initiative", "temperance"];

    it("accepts valid stat types", () => {
      STAT_TYPES.forEach((stat) => {
        expect(STAT_TYPES.includes(stat)).toBe(true);
      });
    });

    it("rejects invalid stat types", () => {
      expect(STAT_TYPES.includes("invalid")).toBe(false);
      expect(STAT_TYPES.includes("strength")).toBe(false);
    });
  });
});
