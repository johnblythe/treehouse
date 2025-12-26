"use client";

import { useMemo } from "react";
import { Member } from "@/lib/types";
import { getColorConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Trophy, Crown, Medal, Award } from "lucide-react";

interface LeaderboardProps {
  members: Member[];
  compact?: boolean;
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-4 h-4 text-amber-500" />;
    case 2:
      return <Medal className="w-4 h-4 text-slate-400" />;
    case 3:
      return <Award className="w-4 h-4 text-orange-400" />;
    default:
      return <span className="w-4 text-center text-xs font-bold text-stone-400">{rank}</span>;
  }
}

function LeaderboardItem({ 
  member, 
  rank, 
  isTop3,
  compact 
}: { 
  member: Member; 
  rank: number;
  isTop3: boolean;
  compact?: boolean;
}) {
  const colorConfig = getColorConfig(member.color);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-xl transition-all",
        isTop3 && "bg-gradient-to-r from-amber-50/50 to-transparent",
        !compact && "hover:bg-stone-50"
      )}
    >
      {/* Rank */}
      <div className="w-6 flex justify-center">
        {getRankIcon(rank)}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
          "bg-gradient-to-br shadow-sm",
          colorConfig.gradient
        )}
      >
        {member.avatar}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "font-semibold truncate block",
          rank === 1 && "text-amber-700"
        )}>
          {member.name}
        </span>
      </div>

      {/* Points */}
      <div className={cn(
        "font-bold tabular-nums",
        rank === 1 ? "text-amber-600" : "text-stone-600"
      )}>
        {member.points}
      </div>
    </div>
  );
}

export function Leaderboard({ members, compact = false }: LeaderboardProps) {
  const rankedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => b.points - a.points);
    
    let currentRank = 1;
    return sorted.map((member, index) => {
      if (index > 0 && member.points === sorted[index - 1].points) {
        return { member, rank: currentRank };
      }
      currentRank = index + 1;
      return { member, rank: currentRank };
    });
  }, [members]);

  if (members.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No rankings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-lg">Leaderboard</h3>
      </div>
      
      <div className="space-y-0.5">
        {rankedMembers.map(({ member, rank }) => (
          <LeaderboardItem
            key={member.id}
            member={member}
            rank={rank}
            isTop3={rank <= 3}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
