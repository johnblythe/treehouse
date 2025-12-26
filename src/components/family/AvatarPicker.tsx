"use client";

import { AVATARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onSelect(avatar)}
          className={cn(
            "text-2xl p-2 rounded-xl transition-all hover:scale-110 active:scale-95",
            selected === avatar
              ? "bg-primary/20 ring-2 ring-primary"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}
