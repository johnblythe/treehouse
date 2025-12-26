"use client";

import { useState, useMemo } from "react";
import { Member } from "@/lib/types";
import { getColorConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Trophy, Crown, Medal, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface LeaderboardRevealProps {
  members: Member[];
  onClose: () => void;
}

function PodiumPlace({ 
  member, 
  rank, 
  delay,
  isRevealed 
}: { 
  member: Member; 
  rank: number;
  delay: number;
  isRevealed: boolean;
}) {
  const colorConfig = getColorConfig(member.color);
  
  const podiumHeight = rank === 1 ? "h-32" : rank === 2 ? "h-24" : "h-20";
  const podiumColor = rank === 1 
    ? "from-amber-300 to-yellow-400" 
    : rank === 2 
    ? "from-slate-300 to-slate-400" 
    : "from-orange-300 to-orange-400";

  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : Award;

  return (
    <div 
      className={cn(
        "flex flex-col items-center transition-all duration-700 ease-out",
        isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Avatar + Name */}
      <div className="mb-3 text-center">
        <div
          className={cn(
            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-2",
            "bg-gradient-to-br",
            colorConfig.gradient,
            rank === 1 && "ring-4 ring-amber-300 ring-offset-2"
          )}
        >
          {member.avatar}
        </div>
        <h3 className="font-bold text-lg">{member.name}</h3>
        <p className="text-2xl font-extrabold text-stone-700">{member.points} pts</p>
      </div>

      {/* Podium */}
      <div 
        className={cn(
          "w-24 rounded-t-xl flex flex-col items-center justify-start pt-3",
          "bg-gradient-to-b shadow-lg",
          podiumHeight,
          podiumColor
        )}
      >
        <RankIcon className={cn(
          "w-8 h-8",
          rank === 1 ? "text-amber-700" : rank === 2 ? "text-slate-600" : "text-orange-700"
        )} />
        <span className="text-2xl font-black mt-1 text-white/90">{rank}</span>
      </div>
    </div>
  );
}

export function LeaderboardReveal({ members, onClose }: LeaderboardRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showPodium, setShowPodium] = useState(false);

  const rankedMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [members]);

  const handleReveal = () => {
    setShowPodium(true);
    
    // Staggered reveal
    setTimeout(() => setIsRevealed(true), 100);
    
    // Confetti for #1
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
      });
    }, 800);

    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
    }, 1200);
  };

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = rankedMembers.length >= 3 
    ? [rankedMembers[1], rankedMembers[0], rankedMembers[2]]
    : rankedMembers;
  const ranks = rankedMembers.length >= 3 ? [2, 1, 3] : [1, 2, 3].slice(0, rankedMembers.length);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-extrabold text-stone-800">Rankings Reveal!</h2>
        </div>

        {!showPodium ? (
          <div className="py-12">
            <Sparkles className="w-16 h-16 mx-auto text-amber-400 mb-6 animate-pulse" />
            <p className="text-lg text-stone-600 mb-8">Ready to see who&apos;s on top?</p>
            <Button 
              onClick={handleReveal}
              size="lg"
              className="rounded-xl font-bold text-lg px-8 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-900 shadow-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Reveal Rankings!
            </Button>
          </div>
        ) : (
          <div className="py-6">
            {/* Podium */}
            <div className="flex items-end justify-center gap-2 mb-8">
              {podiumOrder.map((member, index) => (
                <PodiumPlace
                  key={member.id}
                  member={member}
                  rank={ranks[index]}
                  delay={index === 1 ? 0 : index === 0 ? 400 : 800} // 1st reveals first, then 2nd, then 3rd
                  isRevealed={isRevealed}
                />
              ))}
            </div>

            {/* Close button */}
            <Button 
              onClick={onClose}
              variant="outline"
              className={cn(
                "rounded-xl transition-all duration-500",
                isRevealed ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: "1200ms" }}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
