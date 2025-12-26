"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarPicker } from "./AvatarPicker";
import { ColorPicker } from "./ColorPicker";
import { AVATARS, MEMBER_COLORS } from "@/lib/constants";
import { Member } from "@/lib/types";

interface AddMemberFormProps {
  onAdd: (member: Omit<Member, "id" | "points" | "createdAt">) => void;
  onCancel?: () => void;
}

export function AddMemberForm({ onAdd, onCancel }: AddMemberFormProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(MEMBER_COLORS[0].name);
  const [role, setRole] = useState<"parent" | "child">("child");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      avatar,
      color,
      role,
    });

    // Reset form
    setName("");
    setAvatar(AVATARS[0]);
    setColor(MEMBER_COLORS[0].name);
    setRole("child");
  };

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Add Family Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Pick an avatar</Label>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          <div className="space-y-2">
            <Label>Pick a color</Label>
            <ColorPicker selected={color} onSelect={setColor} />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="parent"
                  checked={role === "parent"}
                  onChange={() => setRole("parent")}
                  className="w-4 h-4"
                />
                <span>Parent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="child"
                  checked={role === "child"}
                  onChange={() => setRole("child")}
                  className="w-4 h-4"
                />
                <span>Child</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              Add Member
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
