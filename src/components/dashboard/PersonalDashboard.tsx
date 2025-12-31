"use client";

import { useStats } from "@/hooks/useStats";
import type { Member } from "@/lib/types";
import { StatRadar } from "./StatRadar";
import { StreakDisplay } from "./StreakDisplay";
import { RecentActivity } from "./RecentActivity";

interface PersonalDashboardProps {
  member: Member;
  compact?: boolean;
  className?: string;
}

export function PersonalDashboard({ member, compact = false, className = "" }: PersonalDashboardProps) {
  const { stats, history, isLoading, error } = useStats(member.id);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        Failed to load stats
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{member.avatar}</span>
          <div>
            <h2 className="font-bold text-lg">{member.name}</h2>
            <p className="text-sm text-gray-500">Level {stats.overallLevel}</p>
          </div>
        </div>

        {/* Streak */}
        <StreakDisplay streak={stats.streak} variant="compact" />

        {/* Mini radar */}
        <div className="flex justify-center">
          <StatRadar stats={stats.stats} size={160} />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-4xl">{member.avatar}</span>
        <div>
          <h2 className="font-bold text-xl">{member.name}</h2>
          <p className="text-sm text-gray-500">
            Level {stats.overallLevel} • {stats.totalXp.toLocaleString()} total XP
          </p>
        </div>
      </div>

      {/* Main content - responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Radar chart */}
        <div className="flex flex-col items-center">
          <StatRadar stats={stats.stats} size={220} />
        </div>

        {/* Right: Streak + Activity */}
        <div className="space-y-6">
          <StreakDisplay streak={stats.streak} variant="full" />
          <RecentActivity activities={history} limit={5} />
        </div>
      </div>
    </div>
  );
}
