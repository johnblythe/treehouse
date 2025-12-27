"use client";

import { useState, useEffect, useCallback } from "react";
import { RouletteSlot, RouletteChore } from "./types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface RouletteGridProps {
  slots: RouletteSlot[];
  onComplete: () => void;
}

const SHUFFLE_TEXTS = [
  "???",
  "...",
  "???",
  "...",
];

export function RouletteGrid({ slots: initialSlots, onComplete }: RouletteGridProps) {
  const [slots, setSlots] = useState<RouletteSlot[]>(initialSlots);
  const [phase, setPhase] = useState<"shuffling" | "landing" | "complete">("shuffling");
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [landedCount, setLandedCount] = useState(0);

  // Shuffle animation - cycle through placeholder texts
  useEffect(() => {
    if (phase !== "shuffling") return;
    
    const interval = setInterval(() => {
      setShuffleIndex(i => (i + 1) % SHUFFLE_TEXTS.length);
    }, 100);

    // After 2 seconds, start landing
    const timeout = setTimeout(() => {
      setPhase("landing");
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase]);

  // Staggered landing animation
  useEffect(() => {
    if (phase !== "landing") return;

    if (landedCount >= slots.length) {
      setPhase("complete");
      
      // Fire confetti for the real chores
      const realCount = slots.filter(s => s.chore.isReal).length;
      if (realCount > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#10b981", "#34d399", "#6ee7b7"],
          });
        }, 300);
      }
      
      setTimeout(onComplete, 1000);
      return;
    }

    // Land slots one by one with random delay
    const timeout = setTimeout(() => {
      setSlots(prev => {
        const updated = [...prev];
        updated[landedCount] = { ...updated[landedCount], state: "landed" };
        return updated;
      });
      setLandedCount(c => c + 1);
    }, 150 + Math.random() * 100);

    return () => clearTimeout(timeout);
  }, [phase, landedCount, slots.length, onComplete]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {slots.map((slot, index) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          shuffleText={SHUFFLE_TEXTS[shuffleIndex]}
          isLanding={phase === "landing" && landedCount === index}
        />
      ))}
    </div>
  );
}

interface SlotCardProps {
  slot: RouletteSlot;
  shuffleText: string;
  isLanding: boolean;
}

function SlotCard({ slot, shuffleText, isLanding }: SlotCardProps) {
  const isLanded = slot.state === "landed";
  const isReal = slot.chore.isReal;

  return (
    <div
      className={cn(
        "relative p-4 rounded-xl border-2 min-h-[80px] flex flex-col items-center justify-center text-center transition-all duration-300",
        // Shuffling state
        !isLanded && "bg-stone-100 border-stone-200",
        !isLanded && "animate-pulse",
        // Landing animation
        isLanding && "scale-105",
        // Landed - decoy (gray)
        isLanded && !isReal && "bg-stone-50 border-stone-200 opacity-60",
        // Landed - real (green glow!)
        isLanded && isReal && "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400 shadow-lg shadow-emerald-200/50",
      )}
    >
      {!isLanded ? (
        // Shuffling display
        <span className="text-2xl font-bold text-stone-400 font-mono">
          {shuffleText}
        </span>
      ) : (
        // Landed display
        <>
          {isReal && (
            <span className="absolute -top-2 -right-2 text-lg">⭐</span>
          )}
          <span className={cn(
            "font-semibold text-sm leading-tight",
            isReal ? "text-emerald-700" : "text-stone-500 line-through decoration-stone-300"
          )}>
            {slot.chore.name}
          </span>
          {isReal && (
            <span className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              +{slot.chore.points} pts
            </span>
          )}
        </>
      )}
    </div>
  );
}
