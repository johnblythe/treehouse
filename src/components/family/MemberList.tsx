"use client";

import { useState, useMemo } from "react";
import { Member } from "@/lib/types";
import { MemberCard } from "./MemberCard";
import { AddMemberForm } from "./AddMemberForm";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface MemberListProps {
  members: Member[];
  onAdd: (member: Omit<Member, "id" | "points" | "createdAt">) => void;
  onUpdate: (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}

export function MemberList({ members, onAdd, onUpdate, onRemove }: MemberListProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Sort members by points (high to low) and compute rankings
  const rankedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => b.points - a.points);
    
    // Assign ranks (handle ties)
    let currentRank = 1;
    return sorted.map((member, index) => {
      // If not first and has same points as previous, keep same rank
      if (index > 0 && member.points === sorted[index - 1].points) {
        return { member, rank: currentRank };
      }
      currentRank = index + 1;
      return { member, rank: currentRank };
    });
  }, [members]);

  const handleAdd = (member: Omit<Member, "id" | "points" | "createdAt">) => {
    onAdd(member);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-stone-800">Family</h2>
        </div>
        {!showAddForm && members.length > 0 && (
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            className="rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 shadow-md"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {members.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-stone-200">
          <Users className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-lg font-semibold text-stone-600 mb-1">No family members yet!</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first family member to get started.</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-1" /> Add First Member
          </Button>
        </div>
      )}

      {/* Horizontal grid of member cards - sorted by points */}
      {members.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {rankedMembers.map(({ member, rank }, index) => (
            <div 
              key={member.id}
              className="animate-bounce-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MemberCard
                member={member}
                rank={rank}
                totalMembers={members.length}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            </div>
          ))}
          
          {/* Add button as last card when not showing form */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-stone-300 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center min-h-[160px] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-8 h-8 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <span className="font-medium text-stone-400 group-hover:text-emerald-600 transition-colors">Add</span>
            </button>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="animate-bounce-in">
          <AddMemberForm
            onAdd={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
}
