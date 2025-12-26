"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  points: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function PointsDisplay({ points, size = "md", showLabel = true }: PointsDisplayProps) {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);
  const [delta, setDelta] = useState(0);
  const prevPoints = useRef(points);

  useEffect(() => {
    if (points !== prevPoints.current) {
      const diff = points - prevPoints.current;
      setDelta(diff);
      setIsAnimating(true);
      
      // Animate the number counting up/down
      const start = prevPoints.current;
      const end = points;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        
        setDisplayPoints(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayPoints(end);
          setTimeout(() => setIsAnimating(false), 500);
        }
      };
      
      requestAnimationFrame(animate);
      prevPoints.current = points;
    }
  }, [points]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const starSizes = {
    sm: "text-yellow-500",
    md: "text-yellow-500 text-lg",
    lg: "text-yellow-500 text-2xl",
  };

  return (
    <div className={cn("relative inline-flex items-center gap-1", sizeClasses[size])}>
      <span className={starSizes[size]}>★</span>
      <span className={cn(
        "font-bold tabular-nums transition-transform",
        isAnimating && "scale-110"
      )}>
        {displayPoints}
      </span>
      {showLabel && <span className="text-muted-foreground">pts</span>}
      
      {/* Floating delta animation */}
      {isAnimating && delta !== 0 && (
        <span
          className={cn(
            "absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-sm animate-bounce",
            delta > 0 ? "text-green-500" : "text-red-500"
          )}
          style={{
            animation: "floatUp 1s ease-out forwards",
          }}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  );
}
