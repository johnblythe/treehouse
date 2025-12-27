"use client";

import { useEffect } from "react";
import { Member } from "@/lib/types";
import { ChoreSlot } from "./types";
import { getColorConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PartyPopper, Frown, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface SpinResultProps {
  slot: ChoreSlot;
  member: Member;
  onAccept: () => void;
  onSpinAgain: () => void;
}

export function SpinResult({ slot, member, onAccept, onSpinAgain }: SpinResultProps) {
  const colorConfig = getColorConfig(member.color);
  const isWin = slot.isReal;

  useEffect(() => {
    if (isWin) {
      // Celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#16a34a', '#fbbf24', '#ffffff'],
      });
    }
  }, [isWin]);

  return (
    <div className="text-center space-y-6">
      {/* Result icon */}
      <div className={cn(
        "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center",
        isWin 
          ? "bg-gradient-to-br from-emerald-400 to-green-500" 
          : "bg-gradient-to-br from-stone-400 to-stone-500"
      )}>
        {isWin ? (
          <PartyPopper className="w-10 h-10 text-white" />
        ) : (
          <Frown className="w-10 h-10 text-white" />
        )}
      </div>

      {/* Message */}
      <div>
        <h3 className={cn(
          "text-2xl font-extrabold",
          isWin ? "text-emerald-600" : "text-stone-600"
        )}>
          {isWin ? "Lucky!" : "Oh no..."}
        </h3>
        <p className="text-muted-foreground mt-1">
          {isWin 
            ? "You got one of the easy ones!" 
            : "Better luck next time..."}
        </p>
      </div>

      {/* Chore */}
      <div className={cn(
        "p-4 rounded-2xl border-2",
        isWin 
          ? "bg-emerald-50 border-emerald-200" 
          : "bg-stone-50 border-stone-200"
      )}>
        <p className="font-bold text-lg">{slot.name}</p>
        <p className="text-sm text-muted-foreground mt-1">
          +{slot.points} points
        </p>
      </div>

      {/* Assigned to */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-muted-foreground">Assigned to:</span>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
              "bg-gradient-to-br",
              colorConfig.gradient
            )}
          >
            {member.avatar}
          </div>
          <span className="font-semibold">{member.name}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onAccept}
          className={cn(
            "flex-1 h-12 rounded-xl font-bold",
            isWin 
              ? "bg-emerald-500 hover:bg-emerald-600" 
              : "bg-stone-600 hover:bg-stone-700"
          )}
        >
          {isWin ? "Claim Points!" : "Accept Fate"}
        </Button>
        <Button
          onClick={onSpinAgain}
          variant="outline"
          className="h-12 rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Again
        </Button>
      </div>
    </div>
  );
}
