"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PickerProps } from "./types";
import confetti from "canvas-confetti";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function PIRWheel({ options, onResult, onCancel }: PickerProps) {
  const [position, setPosition] = useState(0); // Current segment position
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const segmentHeight = 72; // Height of each segment in pixels
  const visibleSegments = 5; // How many segments visible at once

  // Repeat options to create seamless loop
  const repeatedOptions = [...options, ...options, ...options, ...options, ...options];

  // Initialize audio context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playTick = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 600 + Math.random() * 200;
      oscillator.type = "square";
      
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.03);
    } catch {
      // Audio may fail
    }
  }, [soundEnabled]);

  const spin = useCallback(() => {
    if (isSpinning) return;
    
    // Resume audio context if suspended
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    setIsSpinning(true);
    setHasSpun(true);

    // Random spin: land on a random segment
    const targetSegment = Math.floor(Math.random() * options.length);
    
    // Calculate total segments to travel (multiple loops + target)
    const loops = 3 + Math.floor(Math.random() * 2); // 3-4 full loops
    const totalSegments = loops * options.length + targetSegment;
    
    const startPosition = position;
    const targetPosition = startPosition + totalSegments;
    const duration = 4000 + Math.random() * 2000; // 4-6 seconds
    const startTime = Date.now();
    let lastSegment = Math.floor(startPosition);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition + (targetPosition - startPosition) * eased;
      setPosition(currentPosition);

      // Play tick when crossing segment boundaries
      const currentSegment = Math.floor(currentPosition);
      if (currentSegment !== lastSegment) {
        playTick();
        lastSegment = currentSegment;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate winner
        const winnerIndex = Math.floor(currentPosition) % options.length;
        const winner = options[winnerIndex];

        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => onResult(winner), 800);
      }
    };

    requestAnimationFrame(animate);
  }, [isSpinning, position, options, playTick, onResult]);

  // Calculate transform for wheel strip
  const stripOffset = -(position * segmentHeight) + (visibleSegments / 2) * segmentHeight - segmentHeight / 2;

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h2 className="text-2xl font-extrabold text-stone-800">The Big Wheel!</h2>
      
      {/* Wheel container */}
      <div className="relative">
        {/* Frame */}
        <div className="relative w-72 bg-stone-800 rounded-2xl p-2 shadow-2xl">
          {/* Decorative bolts */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-stone-600 shadow-inner" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-stone-600 shadow-inner" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-stone-600 shadow-inner" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-stone-600 shadow-inner" />

          {/* Wheel window */}
          <div 
            ref={containerRef}
            className="relative h-[360px] overflow-hidden rounded-xl bg-stone-900"
            style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}
          >
            {/* Wheel strip */}
            <div 
              className="absolute w-full transition-none"
              style={{ 
                transform: `translateY(${stripOffset}px)`,
              }}
            >
              {repeatedOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  className={cn(
                    "h-[72px] flex items-center justify-center border-b-2 border-stone-700",
                    COLORS[index % COLORS.length]
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{option.emoji || "🎯"}</span>
                    <span className="text-white font-bold text-lg drop-shadow-md">
                      {option.name.length > 12 ? option.name.slice(0, 12) + "…" : option.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center pointer/flapper */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-l-[24px] border-l-amber-400 drop-shadow-lg" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
              <div className="w-0 h-0 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent border-r-[24px] border-r-amber-400 drop-shadow-lg" />
            </div>

            {/* Highlight bar for selected segment */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[72px] border-y-4 border-amber-400 pointer-events-none z-5" />
          </div>
        </div>

        {/* Side pegs decoration */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-stone-700 shadow-md" />
          ))}
        </div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-stone-700 shadow-md" />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <Button
          onClick={spin}
          disabled={isSpinning}
          size="lg"
          className={cn(
            "rounded-2xl font-extrabold text-xl px-8 py-6 shadow-lg transition-all",
            "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
            "hover:from-amber-500 hover:to-orange-600 hover:scale-105",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            isSpinning && "animate-pulse"
          )}
        >
          {isSpinning ? "Spinning..." : hasSpun ? "Spin Again!" : "SPIN!"}
        </Button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-stone-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-stone-400" />
          )}
        </button>

        {onCancel && (
          <Button onClick={onCancel} variant="ghost" className="rounded-xl">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
