"use client";

import { useState } from "react";
import { Activity, Member } from "@/lib/types";
import { getColorConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  members: Member[];
  variant?: "inline" | "sidebar";
  defaultExpanded?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

function ActivityItem({ 
  activity, 
  member,
  compact = false 
}: { 
  activity: Activity; 
  member: Member | undefined;
  compact?: boolean;
}) {
  if (!member) return null;
  
  const colorConfig = getColorConfig(member.color);

  if (compact) {
    return (
      <div className="activity-item flex items-center gap-3 py-2.5 px-2 rounded-xl">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-sm",
            "bg-gradient-to-br shadow-sm",
            colorConfig.gradient
          )}
        >
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{member.name}</span>
            <span className="text-emerald-500 font-bold text-sm">+{activity.points}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{activity.name}</p>
        </div>
        <span className="text-xs text-muted-foreground/70">{formatTimeAgo(activity.completedAt)}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-xl border-2 transition-all",
      colorConfig.light,
      colorConfig.border
    )}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center text-lg",
            "bg-gradient-to-br shadow-sm",
            colorConfig.gradient
          )}
        >
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{member.name}</span>
            <span className="text-emerald-500 font-bold">+{activity.points}</span>
          </div>
          <p className="text-sm text-muted-foreground">{activity.name}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {formatTimeAgo(activity.completedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed({ 
  activities, 
  members, 
  variant = "inline",
  defaultExpanded = true 
}: ActivityFeedProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getMember = (memberId: string) => members.find(m => m.id === memberId);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium">No activity yet!</p>
        <p className="text-sm">Complete tasks to earn points.</p>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="h-full overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg">Activity</h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              member={getMember(activity.memberId)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Inline variant (collapsible)
  return (
    <div className="bg-white/60 backdrop-blur-sm border-2 border-stone-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold">Recent Activity</h3>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 transition-transform",
          isExpanded && "rotate-180"
        )}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-0.5 max-h-72 overflow-y-auto">
          {activities.slice(0, 10).map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              member={getMember(activity.memberId)}
              compact
            />
          ))}
          {activities.length > 10 && (
            <p className="text-xs text-center text-muted-foreground pt-3 pb-1">
              + {activities.length - 10} more
            </p>
          )}
        </div>
      )}
    </div>
  );
}
