"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChoreSlot } from "./types";

interface SpinWheelProps {
  slots: ChoreSlot[];
  onSpinComplete: (slot: ChoreSlot) => void;
  disabled?: boolean;
}

// Generate colors for wheel segments
const SEGMENT_COLORS = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-lime-400 to-green-500",
  "from-cyan-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-yellow-400 to-amber-500",
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
];

export function SpinWheel({ slots, onSpinComplete, disabled }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / slots.length;

  const spin = () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);

    // Random number of full rotations (5-8) plus random final position
    const fullRotations = 5 + Math.floor(Math.random() * 4);
    const randomOffset = Math.random() * 360;
    const totalRotation = rotation + (fullRotations * 360) + randomOffset;

    setRotation(totalRotation);

    // Calculate which slot we'll land on
    // The pointer is at the top (0°), so we need to figure out which segment is there
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      // Wheel spins clockwise, pointer at top
      // Find which segment index is at the top
      const landingAngle = (360 - normalizedRotation + segmentAngle / 2) % 360;
      const landingIndex = Math.floor(landingAngle / segmentAngle) % slots.length;
      
      setIsSpinning(false);
      onSpinComplete(slots[landingIndex]);
    }, 4000); // Match CSS transition duration
  };

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-stone-800 drop-shadow-lg" />
      </div>

      {/* Wheel */}
      <div
        ref={wheelRef}
        className={cn(
          "w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-stone-800",
          "transition-transform duration-[4000ms]",
          isSpinning ? "ease-out" : "ease-out"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {slots.map((slot, index) => {
          const startAngle = index * segmentAngle;
          const midAngle = startAngle + segmentAngle / 2;
          
          return (
            <div
              key={slot.id}
              className={cn(
                "absolute w-full h-full origin-center",
              )}
              style={{
                transform: `rotate(${startAngle}deg)`,
              }}
            >
              {/* Segment */}
              <div
                className={cn(
                  "absolute top-0 left-1/2 h-1/2 origin-bottom",
                  "bg-gradient-to-t",
                  SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                  slot.isReal && "ring-2 ring-inset ring-white/30"
                )}
                style={{
                  width: `${Math.tan((segmentAngle / 2) * (Math.PI / 180)) * 100}%`,
                  transform: `translateX(-50%)`,
                  clipPath: `polygon(50% 100%, 0% 0%, 100% 0%)`,
                }}
              />
              
              {/* Label */}
              <div
                className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center"
                style={{
                  transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
                  width: '80px',
                }}
              >
                <span className={cn(
                  "text-[10px] font-bold text-white drop-shadow-md leading-tight block",
                  "overflow-hidden text-ellipsis",
                  slot.isReal && "text-yellow-100"
                )}>
                  {slot.name.length > 20 ? slot.name.slice(0, 18) + "..." : slot.name}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Center cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 border-4 border-stone-600 shadow-lg z-10 flex items-center justify-center">
          <span className="text-2xl">🎰</span>
        </div>
      </div>

      {/* Spin button (overlay when not spinning) */}
      {!isSpinning && (
        <button
          onClick={spin}
          disabled={disabled}
          className={cn(
            "absolute inset-0 rounded-full bg-black/0 hover:bg-black/10 transition-colors",
            "flex items-center justify-center",
            disabled && "cursor-not-allowed"
          )}
        >
          <span className="sr-only">Spin the wheel</span>
        </button>
      )}
    </div>
  );
}
