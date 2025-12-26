"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getColorConfig } from "@/lib/constants";

interface PointsToastProps {
  memberName: string;
  memberAvatar: string;
  memberColor: string;
  points: number;
  activity: string;
  onDismiss: () => void;
}

export function PointsToast({
  memberName,
  memberAvatar,
  memberColor,
  points,
  activity,
  onDismiss,
}: PointsToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colorConfig = getColorConfig(memberColor);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border-2",
          colorConfig.light,
          "border-white"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
            colorConfig.bg
          )}
        >
          {memberAvatar}
        </div>
        <div>
          <div className="font-bold text-green-600 text-lg">+{points}!</div>
          <div className="text-sm">
            <span className="font-medium">{memberName}</span>
            <span className="text-muted-foreground"> · {activity}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast manager hook
interface ToastData {
  id: string;
  memberName: string;
  memberAvatar: string;
  memberColor: string;
  points: number;
  activity: string;
}

export function usePointsToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (data: Omit<ToastData, "id">) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...data, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, showToast, dismissToast };
}
