"use client";

import { MEMBER_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

// Map legacy names for display
const LEGACY_MAP: Record<string, string> = {
  red: "coral",
  orange: "tangerine",
  yellow: "sunshine", 
  green: "mint",
  blue: "sky",
  purple: "lavender",
  pink: "bubblegum",
  teal: "ocean",
};

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  const normalizedSelected = LEGACY_MAP[selected] || selected;
  
  return (
    <div className="flex gap-2 flex-wrap">
      {MEMBER_COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onSelect(color.name)}
          className={cn(
            "w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-95",
            "bg-gradient-to-br shadow-sm",
            color.gradient,
            normalizedSelected === color.name
              ? "ring-4 ring-offset-2 ring-gray-400 scale-110"
              : "hover:shadow-md"
          )}
          aria-label={`Select ${color.name}`}
        />
      ))}
    </div>
  );
}
