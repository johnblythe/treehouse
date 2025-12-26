"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Meal } from "./types";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface PIRWheelProps {
  meals: Meal[];
  onResult: (meal: Meal) => void;
}

// Segment colors - alternating for visibility
const COLORS = [
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
];

export function PIRWheel({ meals, onResult }: PIRWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickRef = useRef(0);

  const segmentAngle = 360 / meals.length;

  // Create tick sound
  useEffect(() => {
    // Create a simple tick using Web Audio API
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    const playTick = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "square";
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    };

    tickAudioRef.current = { play: playTick } as unknown as HTMLAudioElement;

    return () => {
      audioContext.close();
    };
  }, []);

  // Play tick when crossing segment boundaries
  useEffect(() => {
    if (!isSpinning) return;

    const currentSegment = Math.floor((rotation % 360) / segmentAngle);
    if (currentSegment !== lastTickRef.current) {
      lastTickRef.current = currentSegment;
      try {
        (tickAudioRef.current as unknown as { play: () => void })?.play?.();
      } catch {
        // Audio may fail on some browsers
      }
    }
  }, [rotation, isSpinning, segmentAngle]);

  const spin = useCallback(() => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setHasSpun(true);

    // Random spin: 5-10 full rotations + random landing
    const fullRotations = 5 + Math.random() * 5;
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + (fullRotations * 360) + extraDegrees;

    // Animate with easing
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 4000 + Math.random() * 2000; // 4-6 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + (totalRotation - startRotation) * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate winner (flapper is at top, so we need to find which segment is there)
        // The wheel rotates clockwise, flapper catches at 0 degrees (top)
        const normalizedRotation = ((totalRotation % 360) + 360) % 360;
        // Segments are laid out from top going clockwise
        // At 0 rotation, segment 0 is at top
        // Flapper is at top (0 degrees), so we need to find segment at that position
        const winningIndex = Math.floor(normalizedRotation / segmentAngle) % meals.length;
        const winner = meals[meals.length - 1 - winningIndex] || meals[0];
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => onResult(winner), 500);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, rotation, meals, segmentAngle, onResult]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Wheel container */}
      <div className="relative">
        {/* Flapper/pointer at top */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-stone-800 drop-shadow-lg" />
        </div>

        {/* The wheel */}
        <div
          ref={wheelRef}
          className="relative w-72 h-72 rounded-full border-4 border-stone-800 shadow-2xl overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {meals.map((meal, index) => {
            const startAngle = index * segmentAngle;
            const color = COLORS[index % COLORS.length];
            
            return (
              <div
                key={meal.id}
                className={cn(
                  "absolute w-full h-full origin-center",
                  color
                )}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + segmentAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + segmentAngle - 90) * Math.PI / 180)}%)`,
                }}
              >
                {/* Segment label */}
                <div
                  className="absolute text-white font-bold text-xs whitespace-nowrap drop-shadow-md"
                  style={{
                    left: "50%",
                    top: "20%",
                    transform: `rotate(${startAngle + segmentAngle / 2}deg) translateX(-50%)`,
                    transformOrigin: "center center",
                  }}
                >
                  {meal.emoji && <span className="mr-1">{meal.emoji}</span>}
                  {meal.name.length > 10 ? meal.name.slice(0, 10) + "…" : meal.name}
                </div>
              </div>
            );
          })}
          
          {/* Center hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-stone-800 border-4 border-stone-600 shadow-lg z-10 flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
        </div>

        {/* Decorative pegs around edge */}
        {meals.map((_, index) => {
          const angle = (index * segmentAngle) * Math.PI / 180;
          const radius = 140;
          return (
            <div
              key={index}
              className="absolute w-3 h-3 bg-stone-700 rounded-full shadow-md"
              style={{
                left: `calc(50% + ${Math.sin(angle) * radius}px - 6px)`,
                top: `calc(50% - ${Math.cos(angle) * radius}px - 6px)`,
              }}
            />
          );
        })}
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={cn(
          "px-8 py-4 rounded-2xl font-extrabold text-xl shadow-lg transition-all",
          "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
          "hover:from-amber-500 hover:to-orange-600 hover:scale-105",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          isSpinning && "animate-pulse"
        )}
      >
        {isSpinning ? "Spinning..." : hasSpun ? "Spin Again!" : "SPIN!"}
      </button>
    </div>
  );
}
