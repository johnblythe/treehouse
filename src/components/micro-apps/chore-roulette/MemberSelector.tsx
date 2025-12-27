"use client";

import { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MemberSelectorProps {
  members: Member[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MemberSelector({ members, selectedId, onSelect }: MemberSelectorProps) {
  // Only show kids (non-parents)
  const kids = members.filter(m => m.role === "child");
  const selectableMembers = kids.length > 0 ? kids : members;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Who&apos;s doing chores?
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {selectableMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
              selectedId === member.id
                ? "border-emerald-400 bg-emerald-50 shadow-md scale-105"
                : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
            )}
          >
            <span className="text-xl">{member.avatar}</span>
            <span className="font-semibold text-stone-700">{member.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
