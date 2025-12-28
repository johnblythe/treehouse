"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PickerProps, PickerOption } from "./types";
import confetti from "canvas-confetti";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "intro" | "shuffling" | "picking" | "revealing" | "revealed";

interface BoxState {
  id: number;
  option: PickerOption;
  position: number;
  isSelected: boolean;
  isRevealed: boolean;
}

export function MysteryBox({ options, onResult, onCancel }: PickerProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [boxes, setBoxes] = useState<BoxState[]>([]);
  const [, setSelectedBox] = useState<number | null>(null);

  // Initialize with 3 random options
  const initBoxes = useCallback(() => {
    // Pick 3 random options (or fewer if not enough)
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    // Pad with duplicates if needed
    while (selected.length < 3) {
      selected.push(shuffled[selected.length % shuffled.length]);
    }

    setBoxes(
      selected.map((option, i) => ({
        id: i,
        option,
        position: i,
        isSelected: false,
        isRevealed: false,
      }))
    );
  }, [options]);

  useEffect(() => {
    initBoxes();
  }, [initBoxes]);

  const startShuffle = () => {
    setPhase("shuffling");
    let shuffleCount = 0;
    const maxShuffles = 12;

    const shuffle = () => {
      setBoxes((prev) => {
        const positions = [0, 1, 2].sort(() => Math.random() - 0.5);
        return prev.map((box, i) => ({
          ...box,
          position: positions[i],
        }));
      });
      shuffleCount++;
      
      if (shuffleCount < maxShuffles) {
        setTimeout(shuffle, 200 + shuffleCount * 30); // Slow down gradually
      } else {
        setPhase("picking");
      }
    };

    setTimeout(shuffle, 300);
  };

  const pickBox = (boxId: number) => {
    if (phase !== "picking") return;
    
    setSelectedBox(boxId);
    setBoxes((prev) =>
      prev.map((box) => ({
        ...box,
        isSelected: box.id === boxId,
      }))
    );
    setPhase("revealing");

    // Dramatic pause before reveal
    setTimeout(() => {
      setBoxes((prev) =>
        prev.map((box) => ({
          ...box,
          isRevealed: box.id === boxId,
        }))
      );
      setPhase("revealed");

      // Confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#fbbf24", "#a855f7", "#ec4899", "#22c55e"],
      });

      const winner = boxes.find((b) => b.id === boxId)?.option;
      if (winner) {
        setTimeout(() => onResult(winner), 1500);
      }
    }, 1000);
  };

  const getBoxStyle = (box: BoxState) => {
    const baseX = box.position * 120;
    return {
      transform: `translateX(${baseX}px) ${box.isSelected ? "scale(1.15)" : "scale(1)"}`,
    };
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-stone-800 flex items-center gap-2 justify-center">
          <Gift className="w-7 h-7 text-purple-500" />
          Mystery Box
        </h2>
        <p className="text-stone-500 mt-1">
          {phase === "intro" && "Three mystery boxes... one prize!"}
          {phase === "shuffling" && "Shuffling..."}
          {phase === "picking" && "Pick a box!"}
          {phase === "revealing" && "Opening..."}
          {phase === "revealed" && "You got it!"}
        </p>
      </div>

      {/* Boxes */}
      <div className="relative h-44 w-[360px]">
        {boxes.map((box) => (
          <div
            key={box.id}
            onClick={() => pickBox(box.id)}
            className={cn(
              "absolute top-0 left-0 w-28 h-36 cursor-pointer transition-all duration-500",
              phase === "picking" && "hover:scale-110",
              phase === "shuffling" && "duration-200"
            )}
            style={getBoxStyle(box)}
          >
            {/* Box front (mystery) */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl border-4 flex flex-col items-center justify-center gap-2 transition-all duration-500 backface-hidden",
                box.isRevealed && "opacity-0 rotate-y-180",
                box.isSelected
                  ? "bg-gradient-to-br from-purple-400 to-pink-500 border-purple-300 shadow-xl shadow-purple-300/50"
                  : "bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 shadow-lg",
                phase === "picking" && "hover:border-yellow-300 hover:shadow-yellow-300/30"
              )}
            >
              <span className="text-5xl">🎁</span>
              <span className="text-white font-bold text-sm">?</span>
            </div>

            {/* Box back (revealed) */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl border-4 flex flex-col items-center justify-center gap-2 transition-all duration-500",
                "bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-300 shadow-xl",
                box.isRevealed ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-4xl">{box.option.emoji || "🎉"}</span>
              <span className="text-stone-800 font-bold text-sm text-center px-2 leading-tight">
                {box.option.name}
              </span>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {phase === "intro" && (
          <Button
            onClick={startShuffle}
            size="lg"
            className="rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Shuffle & Pick!
          </Button>
        )}

        {phase === "revealed" && (
          <Button
            onClick={() => {
              setPhase("intro");
              setSelectedBox(null);
              initBoxes();
            }}
            variant="outline"
            className="rounded-xl"
          >
            Play Again
          </Button>
        )}

        {onCancel && phase !== "revealed" && (
          <Button onClick={onCancel} variant="ghost" className="rounded-xl">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
