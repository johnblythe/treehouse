import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DailyCheckIn } from "./DailyCheckIn";
import { Member } from "@/lib/types";

// Mock useStats hook
const mockLogCheckIn = vi.fn();
vi.mock("@/hooks/useStats", () => ({
  useStats: () => ({
    logCheckIn: mockLogCheckIn,
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

describe("DailyCheckIn", () => {
  const mockOnComplete = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogCheckIn.mockResolvedValue({ xpGained: 10 });
  });

  describe("Member Selection", () => {
    it("shows member selector when multiple kids", () => {
      render(
        <DailyCheckIn
          members={[mockKid, mockKid2, mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Who's checking in?")).toBeInTheDocument();
      expect(screen.getByText("Emma")).toBeInTheDocument();
      expect(screen.getByText("Jake")).toBeInTheDocument();
      // Parent should NOT be shown (only kids can check in)
      expect(screen.queryByText("Mom")).not.toBeInTheDocument();
    });

    it("auto-selects when only one kid", () => {
      render(
        <DailyCheckIn
          members={[mockKid, mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Should skip member selection and show form directly
      expect(screen.queryByText("Who's checking in?")).not.toBeInTheDocument();
      expect(screen.getByText(/Hey Emma!/)).toBeInTheDocument();
    });

    it("shows message when no kids", () => {
      render(
        <DailyCheckIn
          members={[mockParent]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Add some family members first!")).toBeInTheDocument();
    });

    it("selects member when clicked", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid, mockKid2]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText("Emma"));

      // Should now show the form
      expect(screen.getByText(/Hey Emma!/)).toBeInTheDocument();
    });
  });

  describe("Check-in Form", () => {
    it("renders mood options", () => {
      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("😫")).toBeInTheDocument();
      expect(screen.getByText("😐")).toBeInTheDocument();
      expect(screen.getByText("🙂")).toBeInTheDocument();
      expect(screen.getByText("😊")).toBeInTheDocument();
      expect(screen.getByText("🤩")).toBeInTheDocument();
    });

    it("renders text input", () => {
      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(
        screen.getByPlaceholderText("I helped my sister with homework...")
      ).toBeInTheDocument();
    });

    it("shows character count", () => {
      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("0/500")).toBeInTheDocument();
    });

    it("updates character count on input", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      const textarea = screen.getByPlaceholderText("I helped my sister with homework...");
      await user.type(textarea, "Hello");

      expect(screen.getByText("5/500")).toBeInTheDocument();
    });

    it("disables submit button without mood selection", () => {
      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      const submitButton = screen.getByRole("button", { name: /save/i });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button after mood selection", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select a mood
      await user.click(screen.getByText("🙂"));

      const submitButton = screen.getByRole("button", { name: /save/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("calls logCheckIn with mood only", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select mood
      await user.click(screen.getByText("😊"));

      // Submit
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(mockLogCheckIn).toHaveBeenCalledWith(4, undefined);
    });

    it("calls logCheckIn with mood and text", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select mood
      await user.click(screen.getByText("🤩"));

      // Enter text
      const textarea = screen.getByPlaceholderText("I helped my sister with homework...");
      await user.type(textarea, "Got an A on my test!");

      // Submit
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(mockLogCheckIn).toHaveBeenCalledWith(5, "Got an A on my test!");
    });

    it("shows success animation after submit", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select mood and submit
      await user.click(screen.getByText("🙂"));
      await user.click(screen.getByRole("button", { name: /save/i }));

      // Wait for success animation
      await waitFor(() => {
        expect(screen.getByText("Nice!")).toBeInTheDocument();
      });
      expect(screen.getByText("+10")).toBeInTheDocument();
      expect(screen.getByText("Wisdom")).toBeInTheDocument();
    });

    it("trims whitespace from text input", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select mood
      await user.click(screen.getByText("🙂"));

      // Enter text with whitespace
      const textarea = screen.getByPlaceholderText("I helped my sister with homework...");
      await user.type(textarea, "  Some text  ");

      // Submit
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(mockLogCheckIn).toHaveBeenCalledWith(3, "Some text");
    });

    it("passes undefined for empty text", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Select mood
      await user.click(screen.getByText("🙂"));

      // Enter only whitespace
      const textarea = screen.getByPlaceholderText("I helped my sister with homework...");
      await user.type(textarea, "   ");

      // Submit
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(mockLogCheckIn).toHaveBeenCalledWith(3, undefined);
    });
  });

  describe("Close Behavior", () => {
    it("calls onClose when cancel clicked", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when X clicked", async () => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      // Find the X button (close icon button)
      const closeButtons = screen.getAllByRole("button");
      const xButton = closeButtons.find((btn) => btn.querySelector("svg"));
      if (xButton) await user.click(xButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Mood Values", () => {
    it.each([
      { emoji: "😫", expectedValue: 1 },
      { emoji: "😐", expectedValue: 2 },
      { emoji: "🙂", expectedValue: 3 },
      { emoji: "😊", expectedValue: 4 },
      { emoji: "🤩", expectedValue: 5 },
    ])("maps $emoji to value $expectedValue", async ({ emoji, expectedValue }) => {
      const user = userEvent.setup();

      render(
        <DailyCheckIn
          members={[mockKid]}
          onComplete={mockOnComplete}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText(emoji));
      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(mockLogCheckIn).toHaveBeenCalledWith(expectedValue, undefined);
    });
  });
});
