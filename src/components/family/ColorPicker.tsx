"use client";

import { MEMBER_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MEMBER_COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onSelect(color.name)}
          className={cn(
            "w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95",
            color.bg,
            selected === color.name
              ? "ring-4 ring-offset-2 ring-gray-400"
              : ""
          )}
          aria-label={`Select ${color.name}`}
        />
      ))}
    </div>
  );
}
