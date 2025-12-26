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
import { Pencil, Trash2, Check, X } from "lucide-react";

interface MemberCardProps {
  member: Member;
  onUpdate: (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}

export function MemberCard({ member, onUpdate, onRemove }: MemberCardProps) {
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

  if (isEditing) {
    return (
      <Card className="border-2 border-primary">
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Avatar</p>
            <AvatarPicker selected={editAvatar} onSelect={setEditAvatar} />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Color</p>
            <ColorPicker selected={editColor} onSelect={setEditColor} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button onClick={handleCancel} size="sm" variant="outline">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", colorConfig.light)}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                colorConfig.bg
              )}
            >
              {member.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="text-yellow-500">&#9733;</span>
                {member.points} pts
                <span className="mx-1">·</span>
                <span className="capitalize">{member.role}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {showDeleteConfirm ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
