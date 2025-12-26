"use client";

import { useState } from "react";
import { Member } from "@/lib/types";
import { MemberCard } from "./MemberCard";
import { AddMemberForm } from "./AddMemberForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MemberListProps {
  members: Member[];
  onAdd: (member: Omit<Member, "id" | "points" | "createdAt">) => void;
  onUpdate: (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}

export function MemberList({ members, onAdd, onUpdate, onRemove }: MemberListProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (member: Omit<Member, "id" | "points" | "createdAt">) => {
    onAdd(member);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Family Members</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {members.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg mb-2">No family members yet!</p>
          <p className="text-sm">Add your first family member to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {showAddForm && (
        <AddMemberForm
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
