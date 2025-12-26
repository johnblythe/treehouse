"use client";

import { useLocalStorage } from "./useLocalStorage";
import { Member } from "@/lib/types";

export function useFamily() {
  const [members, setMembers, isHydrated] = useLocalStorage<Member[]>("family-members", []);

  const addMember = (member: Omit<Member, "id" | "points" | "createdAt">) => {
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      points: 0,
      createdAt: new Date().toISOString(),
    };
    setMembers([...members, newMember]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const awardPoints = (id: string, points: number) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, points: m.points + points } : m
    ));
  };

  const getMember = (id: string) => members.find(m => m.id === id);

  return {
    members,
    isHydrated,
    addMember,
    updateMember,
    removeMember,
    awardPoints,
    getMember,
  };
}
