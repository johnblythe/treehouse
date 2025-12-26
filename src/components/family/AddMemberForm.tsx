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
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

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

    setName("");
    setAvatar(AVATARS[0]);
    setColor(MEMBER_COLORS[0].name);
    setRole("child");
  };

  return (
    <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
        <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
          <UserPlus className="w-5 h-5" />
          Add Family Member
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="text-lg h-12 rounded-xl border-2 focus:border-emerald-400"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Pick an avatar</Label>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Pick a color</Label>
            <ColorPicker selected={color} onSelect={setColor} />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Role</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole("parent")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-medium transition-all border-2",
                  role === "parent"
                    ? "bg-amber-100 border-amber-300 text-amber-700"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"
                )}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setRole("child")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-medium transition-all border-2",
                  role === "child"
                    ? "bg-sky-100 border-sky-300 text-sky-700"
                    : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"
                )}
              >
                Child
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 h-12 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 shadow-md" 
              disabled={!name.trim()}
            >
              Add Member
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="h-12 rounded-xl font-medium border-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
