import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonalDashboard } from "./PersonalDashboard";
import { StatRadar } from "./StatRadar";
import { StreakDisplay } from "./StreakDisplay";
import { RecentActivity } from "./RecentActivity";
import { Member } from "@/lib/types";
import type { StatData, StreakData, ActivityLogEntry, MemberStats } from "@/hooks/useStats";
import { STAT_INFO, StatType } from "@/lib/stats";

// Mock useStats hook
const mockStats: MemberStats = {
  memberId: "kid-1",
  memberName: "Emma",
  stats: {
    grit: { statType: "grit", currentXp: 150, level: 3, info: STAT_INFO.grit },
    wisdom: { statType: "wisdom", currentXp: 100, level: 2, info: STAT_INFO.wisdom },
    heart: { statType: "heart", currentXp: 200, level: 4, info: STAT_INFO.heart },
    initiative: { statType: "initiative", currentXp: 50, level: 1, info: STAT_INFO.initiative },
    temperance: { statType: "temperance", currentXp: 75, level: 2, info: STAT_INFO.temperance },
  },
  overallLevel: 2,
  totalXp: 575,
  streak: { current: 5, best: 10, comebacks: 2, lastActiveDate: new Date().toISOString() },
  todayCheckIn: null,
};

const mockHistory: ActivityLogEntry[] = [
  {
    id: "1",
    activityType: "self_report",
    statAffected: "grit",
    statEmoji: "💪",
    statName: "Grit",
    xpGained: 15,
    description: "Told the truth about something hard",
    metadata: null,
    createdAt: new Date().toISOString(),
    displayText: "Told the truth about something hard",
  },
  {
    id: "2",
    activityType: "check_in",
    statAffected: "wisdom",
    statEmoji: "🧠",
    statName: "Wisdom",
    xpGained: 10,
    description: "Daily check-in",
    metadata: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    displayText: "Daily check-in",
  },
];

vi.mock("@/hooks/useStats", () => ({
  useStats: vi.fn(() => ({
    stats: mockStats,
    history: mockHistory,
    isLoading: false,
    error: null,
  })),
}));

// Test data
const mockKid: Member = {
  id: "kid-1",
  name: "Emma",
  avatar: "👧",
  color: "pink",
  role: "child",
  points: 100,
  createdAt: new Date().toISOString(),
};

describe("StatRadar", () => {
  const testStats: Record<StatType, StatData> = {
    grit: { statType: "grit", currentXp: 150, level: 3, info: STAT_INFO.grit },
    wisdom: { statType: "wisdom", currentXp: 100, level: 2, info: STAT_INFO.wisdom },
    heart: { statType: "heart", currentXp: 200, level: 4, info: STAT_INFO.heart },
    initiative: { statType: "initiative", currentXp: 50, level: 1, info: STAT_INFO.initiative },
    temperance: { statType: "temperance", currentXp: 75, level: 2, info: STAT_INFO.temperance },
  };

  it("renders SVG pentagon chart", () => {
    render(<StatRadar stats={testStats} />);

    // Should have SVG element
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows all stat emojis as labels", () => {
    render(<StatRadar stats={testStats} />);

    expect(screen.getByText("💪")).toBeInTheDocument();
    expect(screen.getByText("🧠")).toBeInTheDocument();
    expect(screen.getByText("❤️")).toBeInTheDocument();
    expect(screen.getByText("⚡")).toBeInTheDocument();
    expect(screen.getByText("⚖️")).toBeInTheDocument();
  });

  it("shows level numbers next to emojis", () => {
    render(<StatRadar stats={testStats} />);

    // Check for level values (some may appear multiple times)
    expect(screen.getByText("3")).toBeInTheDocument(); // grit
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1); // wisdom & temperance
    expect(screen.getByText("4")).toBeInTheDocument(); // heart
    expect(screen.getByText("1")).toBeInTheDocument(); // initiative
  });

  it("accepts custom size prop", () => {
    render(<StatRadar stats={testStats} size={300} />);

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("width", "300");
    expect(svg).toHaveAttribute("height", "300");
  });
});

describe("StreakDisplay", () => {
  const testStreak: StreakData = {
    current: 5,
    best: 12,
    comebacks: 3,
    lastActiveDate: new Date().toISOString(),
  };

  it("renders compact variant by default", () => {
    render(<StreakDisplay streak={testStreak} />);

    expect(screen.getByText("🔥")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("🏆")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("💪")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders full variant with more detail", () => {
    render(<StreakDisplay streak={testStreak} variant="full" />);

    expect(screen.getByText("5 days")).toBeInTheDocument();
    expect(screen.getByText("Current streak")).toBeInTheDocument();
    expect(screen.getByText("Miss a day? No worries - you get 1-2 rest days per week.")).toBeInTheDocument();
  });

  it("hides comebacks if count is 0", () => {
    const noComeback: StreakData = { ...testStreak, comebacks: 0 };
    render(<StreakDisplay streak={noComeback} />);

    // Should not show comeback section
    expect(screen.queryByTitle("Comebacks")).not.toBeInTheDocument();
  });
});

describe("RecentActivity", () => {
  it("renders activity list", () => {
    render(<RecentActivity activities={mockHistory} />);

    expect(screen.getByText("Recent Growth")).toBeInTheDocument();
    expect(screen.getByText("+15")).toBeInTheDocument();
    expect(screen.getByText("+10")).toBeInTheDocument();
  });

  it("shows empty state when no activities", () => {
    render(<RecentActivity activities={[]} />);

    expect(screen.getByText("No activity yet. Start logging your wins!")).toBeInTheDocument();
  });

  it("respects limit prop", () => {
    const manyActivities = [...mockHistory, ...mockHistory, ...mockHistory];
    render(<RecentActivity activities={manyActivities} limit={2} />);

    // Should only show 2 items
    const items = screen.getAllByText(/\+\d+/);
    expect(items.length).toBe(2);
  });
});

describe("PersonalDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders member info", () => {
    render(<PersonalDashboard member={mockKid} />);

    expect(screen.getByText("Emma")).toBeInTheDocument();
    expect(screen.getByText("👧")).toBeInTheDocument();
  });

  it("shows overall level and total XP", () => {
    render(<PersonalDashboard member={mockKid} />);

    expect(screen.getByText(/Level 2/)).toBeInTheDocument();
    expect(screen.getByText(/575 total XP/)).toBeInTheDocument();
  });

  it("renders compact variant", () => {
    render(<PersonalDashboard member={mockKid} compact />);

    // Compact version should show level but not total XP text
    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.queryByText(/total XP/)).not.toBeInTheDocument();
  });

  // Loading state test would require resetting the mock, skipping for simplicity
});
