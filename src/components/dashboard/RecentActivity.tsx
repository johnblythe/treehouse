"use client";

import type { ActivityLogEntry } from "@/hooks/useStats";

interface RecentActivityProps {
  activities: ActivityLogEntry[];
  limit?: number;
  className?: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentActivity({ activities, limit = 5, className = "" }: RecentActivityProps) {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No activity yet. Start logging your wins!
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Growth</h3>
      <ul className="space-y-1.5">
        {displayActivities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-start gap-2 text-sm"
          >
            <span className="text-green-600 font-medium whitespace-nowrap">
              +{activity.xpGained}
            </span>
            <span className="text-base" title={activity.statName}>
              {activity.statEmoji}
            </span>
            <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">
              {activity.displayText || activity.description || activity.activityType}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatRelativeTime(activity.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
