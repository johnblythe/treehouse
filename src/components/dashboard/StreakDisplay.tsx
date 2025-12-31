"use client";

import type { StreakData } from "@/hooks/useStats";

interface StreakDisplayProps {
  streak: StreakData;
  className?: string;
  variant?: "compact" | "full";
}

export function StreakDisplay({ streak, className = "", variant = "compact" }: StreakDisplayProps) {
  const { current, best, comebacks } = streak;

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 text-sm ${className}`}>
        <span className="flex items-center gap-1" title="Current streak">
          <span className="text-lg">🔥</span>
          <span className="font-medium">{current}</span>
        </span>
        <span className="flex items-center gap-1" title="Best streak">
          <span className="text-lg">🏆</span>
          <span className="font-medium">{best}</span>
        </span>
        {comebacks > 0 && (
          <span className="flex items-center gap-1" title="Comebacks">
            <span className="text-lg">💪</span>
            <span className="font-medium">{comebacks}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-2xl font-bold">{current} day{current !== 1 ? "s" : ""}</div>
          <div className="text-xs text-gray-500">Current streak</div>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span>🏆</span>
          <span>Best: <strong>{best}</strong></span>
        </div>
        {comebacks > 0 && (
          <div className="flex items-center gap-1">
            <span>💪</span>
            <span>Comebacks: <strong>{comebacks}</strong></span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 italic">
        Miss a day? No worries - you get 1-2 rest days per week.
      </p>
    </div>
  );
}
