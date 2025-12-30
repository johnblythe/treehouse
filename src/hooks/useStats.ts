"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StatType,
  ActivityType,
  STAT_INFO,
  SELF_REPORT_PRESETS,
  getLevelProgress,
} from "@/lib/stats";

// Types
export interface StatData {
  statType: StatType;
  currentXp: number;
  level: number;
  info: {
    emoji: string;
    name: string;
    description: string;
    color: string;
  };
  progress?: number; // Progress to next level (0-100)
}

export interface StreakData {
  current: number;
  best: number;
  comebacks: number;
  lastActiveDate: string | null;
}

export interface TodayCheckIn {
  id: string;
  mood: number;
  description: string | null;
  xpGained: number;
  createdAt: string;
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  stats: Record<StatType, StatData>;
  overallLevel: number;
  totalXp: number;
  streak: StreakData;
  todayCheckIn: TodayCheckIn | null;
}

export interface ActivityLogEntry {
  id: string;
  activityType: ActivityType;
  statAffected: StatType;
  statEmoji: string;
  statName: string;
  xpGained: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  displayText: string;
}

export interface LogActivityParams {
  activityType: ActivityType;
  statAffected: StatType;
  description?: string;
  metadata?: Record<string, unknown>;
  wasHard?: boolean;
}

export function useStats(memberId: string | null) {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [history, setHistory] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats for member
  const fetchStats = useCallback(async () => {
    if (!memberId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/stats/${memberId}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();

      // Add progress to each stat
      const statsWithProgress: Record<StatType, StatData> = {} as any;
      for (const [key, stat] of Object.entries(data.stats) as [StatType, StatData][]) {
        statsWithProgress[key] = {
          ...stat,
          progress: getLevelProgress(stat.currentXp),
        };
      }

      setStats({
        ...data,
        stats: statsWithProgress,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  // Fetch activity history
  const fetchHistory = useCallback(
    async (limit = 20) => {
      if (!memberId) {
        setHistory([]);
        return;
      }

      try {
        const res = await fetch(`/api/stats/${memberId}/history?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data.activities);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    },
    [memberId]
  );

  // Load initial data
  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [fetchStats, fetchHistory]);

  // Log an activity and grant XP
  const logActivity = useCallback(
    async (params: LogActivityParams) => {
      if (!memberId) {
        throw new Error("No member selected");
      }

      try {
        const res = await fetch("/api/stats/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId,
            ...params,
            hasDescription: !!params.description,
          }),
        });

        if (!res.ok) throw new Error("Failed to log activity");
        const result = await res.json();

        // Refresh stats and history
        await fetchStats();
        await fetchHistory();

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      }
    },
    [memberId, fetchStats, fetchHistory]
  );

  // Quick log presets
  const logPreset = useCallback(
    async (presetId: string, wasHard = false, description?: string) => {
      const preset = SELF_REPORT_PRESETS.find((p) => p.id === presetId);
      if (!preset) {
        throw new Error(`Unknown preset: ${presetId}`);
      }

      return logActivity({
        activityType: "self_report",
        statAffected: preset.stat,
        description: description || preset.label,
        wasHard,
        metadata: { preset: presetId },
      });
    },
    [logActivity]
  );

  // Log daily check-in
  const logCheckIn = useCallback(
    async (mood: number, proudOf?: string) => {
      return logActivity({
        activityType: "check_in",
        statAffected: "wisdom",
        description: proudOf,
        metadata: { mood },
      });
    },
    [logActivity]
  );

  // Log micro-app activity
  const logMicroApp = useCallback(
    async (
      appType: "chore_spinner" | "dinner_picker",
      statAffected: StatType,
      description?: string
    ) => {
      return logActivity({
        activityType: "micro_app",
        statAffected,
        description,
        metadata: { app: appType },
      });
    },
    [logActivity]
  );

  return {
    // Data
    stats,
    history,
    isLoading,
    error,

    // Actions
    logActivity,
    logPreset,
    logCheckIn,
    logMicroApp,
    refresh: fetchStats,
    refreshHistory: fetchHistory,

    // Helpers
    presets: SELF_REPORT_PRESETS,
    statInfo: STAT_INFO,
  };
}
