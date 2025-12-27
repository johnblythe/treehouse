"use client";

import { Member } from "@/lib/types";
import { getColorConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MemberSelectorProps {
  members: Member[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MemberSelector({ members, selectedId, onSelect }: MemberSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-center text-muted-foreground">
        Who&apos;s spinning?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {members.map((member) => {
          const colorConfig = getColorConfig(member.color);
          const isSelected = selectedId === member.id;
          
          return (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all",
                "hover:scale-105 active:scale-95",
                isSelected 
                  ? "bg-emerald-100 ring-2 ring-emerald-500 ring-offset-2" 
                  : "bg-stone-50 hover:bg-stone-100"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md",
                    "bg-gradient-to-br",
                    colorConfig.gradient
                  )}
                >
                  {member.avatar}
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <span className={cn(
                "text-sm font-medium mt-2",
                isSelected ? "text-emerald-700" : "text-stone-600"
              )}>
                {member.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
