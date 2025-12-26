"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Member } from "@/lib/types";
import { getColorConfig } from "@/lib/constants";
import { AvatarPicker } from "./AvatarPicker";
import { ColorPicker } from "./ColorPicker";
import { cn } from "@/lib/utils";
import { Trash2, Check, X, Crown, Medal, Award } from "lucide-react";
import { PointsDisplay } from "@/components/points";

interface MemberCardProps {
  member: Member;
  rank?: number;
  totalMembers?: number;
  onUpdate: (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}

// Rank badge component
function RankBadge({ rank, totalMembers }: { rank: number; totalMembers: number }) {
  // Only show badges if there are at least 2 members with points
  if (totalMembers < 2) return null;
  
  if (rank === 1) {
    return (
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center shadow-md border-2 border-white z-20 animate-bounce-in">
        <Crown className="w-4 h-4 text-amber-700" />
      </div>
    );
  }
  
  if (rank === 2) {
    return (
      <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center shadow-md border-2 border-white z-20">
        <Medal className="w-3.5 h-3.5 text-slate-600" />
      </div>
    );
  }
  
  if (rank === 3) {
    return (
      <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center shadow-md border-2 border-white z-20">
        <Award className="w-3.5 h-3.5 text-orange-700" />
      </div>
    );
  }
  
  return null;
}

export function MemberCard({ member, rank = 0, totalMembers = 0, onUpdate, onRemove }: MemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [editAvatar, setEditAvatar] = useState(member.avatar);
  const [editColor, setEditColor] = useState(member.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const colorConfig = getColorConfig(member.color);

  const handleSave = () => {
    onUpdate(member.id, {
      name: editName.trim() || member.name,
      avatar: editAvatar,
      color: editColor,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(member.name);
    setEditAvatar(member.avatar);
    setEditColor(member.color);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onRemove(member.id);
    setShowDeleteConfirm(false);
  };

  // Edit mode - full form
  if (isEditing) {
    return (
      <Card className="border-2 border-primary shadow-lg animate-bounce-in col-span-full">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-lg font-semibold h-12 rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Avatar</p>
            <AvatarPicker selected={editAvatar} onSelect={setEditAvatar} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Color</p>
            <ColorPicker selected={editColor} onSelect={setEditColor} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} size="lg" className="flex-1 rounded-xl font-semibold">
              <Check className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handleCancel} size="lg" variant="outline" className="rounded-xl">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact card view
  return (
    <div 
      className={cn(
        "group relative p-4 rounded-2xl border-2 transition-all cursor-pointer",
        "hover:shadow-lg hover:scale-[1.02]",
        colorConfig.light,
        colorConfig.border,
        rank === 1 && member.points > 0 && "ring-2 ring-amber-300 ring-offset-2"
      )}
      onClick={() => !showDeleteConfirm && setIsEditing(true)}
    >
      {/* Rank badge */}
      {member.points > 0 && (
        <RankBadge rank={rank} totalMembers={totalMembers} />
      )}

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 z-10 animate-bounce-in"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-stone-600">Remove {member.name}?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDelete} className="rounded-lg">
              Delete
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div
        className={cn(
          "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-md mb-3",
          "bg-gradient-to-br",
          colorConfig.gradient
        )}
      >
        {member.avatar}
      </div>

      {/* Name */}
      <h3 className="font-bold text-center text-stone-800 truncate">{member.name}</h3>

      {/* Points */}
      <div className="flex justify-center mt-1">
        <PointsDisplay points={member.points} size="sm" showLabel={false} />
      </div>

      {/* Role badge */}
      <div className="flex justify-center mt-2">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          member.role === "parent" 
            ? "bg-amber-200/80 text-amber-700" 
            : "bg-sky-200/80 text-sky-700"
        )}>
          {member.role}
        </span>
      </div>

      {/* Delete button - top right, visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteConfirm(true);
        }}
        className={cn(
          "absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center",
          "bg-white/80 text-stone-400 hover:text-red-500 hover:bg-red-50",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
