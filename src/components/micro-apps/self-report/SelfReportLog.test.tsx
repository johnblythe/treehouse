import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelfReportLog } from "./SelfReportLog";
import { Member } from "@/lib/types";

// Mock useStats hook
const mockLogPreset = vi.fn();
const mockLogActivity = vi.fn();
vi.mock("@/hooks/useStats", () => ({
  useStats: () => ({
    logPreset: mockLogPreset,
    logActivity: mockLogActivity,
    presets: [
      { id: "helped_someone", label: "I helped someone", stat: "heart" },
      { id: "without_asking", label: "I did something without being asked", stat: "initiative" },
      { id: "saved_money", label: "I saved money / didn't buy something", stat: "temperance" },
      { id: "told_truth", label: "I told the truth about something hard", stat: "grit" },
      { id: "stayed_calm", label: "I stayed calm when upset", stat: "temperance" },
      { id: "finished_hard", label: "I finished something I didn't want to", stat: "grit" },
    ],
    statInfo: {
      grit: { emoji: "💪", name: "Grit", description: "", color: "orange" },
      wisdom: { emoji: "🧠", name: "Wisdom", description: "", color: "purple" },
      heart: { emoji: "❤️", name: "Heart", description: "", color: "pink" },
      initiative: { emoji: "⚡", name: "Initiative", description: "", color: "yellow" },
      temperance: { emoji: "⚖️", name: "Temperance", description: "", color: "blue" },
    },
    stats: null,
    isLoading: false,
  }),
}));

// Test data
const mockKid: Member = {
  id: "kid-1",
  name: "Emma",
  avatar: "👧",
  color: "pink",
  role: "child",
  points: 0,
  createdAt: new Date().toISOString(),
};

const mockKid2: Member = {
  id: "kid-2",
  name: "Jake",
  avatar: "👦",
  color: "blue",
  role: "child",
  points: 0,
  createdAt: new Date().toISOString(),
};

const mockParent: Member = {
  id: "parent-1",
  name: "Mom",
  avatar: "👩",
  color: "purple",
  role: "parent",
  points: 0,
  createdAt: new Date().toISOString(),
};

describe("SelfReportLog", () => {
  const mockOnComplete = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogPreset.mockResolvedValue({ xpGained: 15 });
    mockLogActivity.mockResolvedValue({ xpGained: 20 });
  });

  describe("Initial State", () => {
    it("shows message when no kids", () => {
      render(
        <SelfReportLog
          members={[mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Add some family members first!")).toBeInTheDocument();
    });

    it("shows preset grid when one kid (auto-selected)", () => {
      render(
        <SelfReportLog
          members={[mockKid, mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Log a Win")).toBeInTheDocument();
      expect(screen.getByText("I helped someone")).toBeInTheDocument();
      expect(screen.getByText("Something else...")).toBeInTheDocument();
    });

    it("shows member dropdown when multiple kids", () => {
      render(
        <SelfReportLog
          members={[mockKid, mockKid2, mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Should have a dropdown to select who's logging
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Select who's logging a win above")).toBeInTheDocument();
    });

    it("filters out parents from dropdown", () => {
      render(
        <SelfReportLog
          members={[mockKid, mockKid2, mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      const dropdown = screen.getByRole("combobox");
      expect(dropdown).not.toHaveTextContent("Mom");
    });
  });

  describe("Preset Selection", () => {
    it("shows all 6 presets", () => {
      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("I helped someone")).toBeInTheDocument();
      expect(screen.getByText("I did something without being asked")).toBeInTheDocument();
      expect(screen.getByText("I saved money / didn't buy something")).toBeInTheDocument();
      expect(screen.getByText("I told the truth about something hard")).toBeInTheDocument();
      expect(screen.getByText("I stayed calm when upset")).toBeInTheDocument();
      expect(screen.getByText("I finished something I didn't want to")).toBeInTheDocument();
    });

    it("navigates to details screen when preset clicked", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));

      // Should show details form with preset label
      expect(screen.getByText("I helped someone")).toBeInTheDocument();
      expect(screen.getByText("Was this hard for you?")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Add more details/)).toBeInTheDocument();
    });

    it("disables presets when no member selected (multiple kids)", () => {
      render(
        <SelfReportLog
          members={[mockKid, mockKid2]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      const presetButton = screen.getByText("I helped someone").closest("button");
      expect(presetButton).toBeDisabled();
    });
  });

  describe("Details Form", () => {
    it("shows XP preview on submit button", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));

      // Base XP = 15
      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toHaveTextContent("+15");
    });

    it("updates XP preview when wasHard checked", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByLabelText(/Was this hard for you/));

      // Base + hard bonus = 15 + 5 = 20
      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toHaveTextContent("+20");
    });

    it("updates XP preview when description added", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.type(screen.getByPlaceholderText(/Add more details/), "I helped with homework");

      // Base + description bonus = 15 + 5 = 20
      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toHaveTextContent("+20");
    });

    it("shows max XP with all bonuses", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByLabelText(/Was this hard for you/));
      await user.type(screen.getByPlaceholderText(/Add more details/), "I helped");

      // Base + hard + description = 15 + 5 + 5 = 25
      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toHaveTextContent("+25");
    });

    it("goes back when Back button clicked", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByRole("button", { name: /Back/i }));

      // Should be back at preset grid
      expect(screen.getByText("Log a Win")).toBeInTheDocument();
      expect(screen.getAllByText("I helped someone")).toHaveLength(1); // In grid
    });

    it("shows char count only near limit", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));

      // Short text - no counter shown
      await user.type(screen.getByPlaceholderText(/Add more details/), "Short");
      expect(screen.queryByText(/\/200/)).not.toBeInTheDocument();

      // Clear and add long text (over 150 chars)
      const textarea = screen.getByPlaceholderText(/Add more details/);
      await user.clear(textarea);
      await user.type(textarea, "A".repeat(160));
      expect(screen.getByText("160/200")).toBeInTheDocument();
    });
  });

  describe("Custom Log", () => {
    it("navigates to custom form when 'Something else...' clicked", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("Something else..."));

      expect(screen.getByText("Something Else")).toBeInTheDocument();
      expect(screen.getByText("Which stat does this build?")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("requires description for custom log", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("Something else..."));

      // Submit button should be disabled without description
      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toBeDisabled();

      // Add description
      await user.type(screen.getByPlaceholderText(/I did something/), "Shared my lunch");
      expect(submitButton).not.toBeDisabled();
    });

    it("allows stat selection for custom log", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("Something else..."));

      // Change stat
      await user.selectOptions(screen.getByRole("combobox"), "heart");

      // Should reflect the heart emoji
      await user.type(screen.getByPlaceholderText(/I did something/), "Shared my lunch");

      const submitButton = screen.getByRole("button", { name: /Log It!/i });
      expect(submitButton).toHaveTextContent("❤️");
    });
  });

  describe("Form Submission", () => {
    it("calls logPreset for preset selection", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByRole("button", { name: /Log It!/i }));

      expect(mockLogPreset).toHaveBeenCalledWith("helped_someone", false, undefined);
    });

    it("calls logPreset with wasHard", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByLabelText(/Was this hard for you/));
      await user.click(screen.getByRole("button", { name: /Log It!/i }));

      expect(mockLogPreset).toHaveBeenCalledWith("helped_someone", true, undefined);
    });

    it("calls logPreset with description", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.type(screen.getByPlaceholderText(/Add more details/), "Helped with homework");
      await user.click(screen.getByRole("button", { name: /Log It!/i }));

      expect(mockLogPreset).toHaveBeenCalledWith("helped_someone", false, "Helped with homework");
    });

    it("calls logActivity for custom log", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("Something else..."));
      await user.selectOptions(screen.getByRole("combobox"), "heart");
      await user.type(screen.getByPlaceholderText(/I did something/), "Shared my lunch");
      await user.click(screen.getByLabelText(/Was this hard for you/));
      await user.click(screen.getByRole("button", { name: /Log It!/i }));

      expect(mockLogActivity).toHaveBeenCalledWith({
        activityType: "self_report",
        statAffected: "heart",
        description: "Shared my lunch",
        wasHard: true,
      });
    });

    it("calls onComplete after successful submit", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));
      await user.click(screen.getByRole("button", { name: /Log It!/i }));

      // Wait for the API call to resolve
      await waitFor(() => {
        expect(mockLogPreset).toHaveBeenCalled();
      });

      // Advance timers past the success animation delay (2000ms)
      vi.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(15);
      });

      vi.useRealTimers();
    });
  });

  describe("Close Behavior", () => {
    it("calls onClose when X clicked on preset grid", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      const closeButtons = screen.getAllByRole("button");
      const xButton = closeButtons.find((btn) => btn.querySelector("svg"));
      if (xButton) await user.click(xButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when X clicked on details form", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("I helped someone"));

      // Find all icon buttons (those with svg) and filter for the X close button
      const buttons = screen.getAllByRole("button");
      // X button should be in position after the back button, look for svg that is not chevron
      const xButton = buttons.find((btn) => {
        const svg = btn.querySelector("svg");
        if (!svg) return false;
        // The back button has ChevronLeft, the X has X icon
        // Check if it's the second icon button (first is back, second is X)
        return btn.getAttribute("class")?.includes("rounded-xl") && !btn.textContent?.includes("Back");
      });

      // If can't find, just get the last button with svg (skip Back)
      const iconButtons = buttons.filter((btn) => btn.querySelector("svg"));
      const closeBtn = iconButtons.length > 1 ? iconButtons[1] : iconButtons[0];
      await user.click(closeBtn);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Member Selection (Multiple Kids)", () => {
    it("enables presets after member selected", async () => {
      const user = userEvent.setup();

      render(
        <SelfReportLog
          members={[mockKid, mockKid2]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Initially disabled
      const presetButton = screen.getByText("I helped someone").closest("button");
      expect(presetButton).toBeDisabled();

      // Select member
      await user.selectOptions(screen.getByRole("combobox"), "kid-1");

      // Now enabled
      expect(presetButton).not.toBeDisabled();
    });
  });
});
