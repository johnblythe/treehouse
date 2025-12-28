"use client";

import { useState, useEffect, useCallback } from "react";
import { Member } from "@/lib/types";

export function useFamily() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members from API
  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      // Transform DB format to app format
      setMembers(
        data.map((m: Record<string, unknown>) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar || "👤",
          color: m.color || "stone",
          role: m.role,
          points: m.points,
          createdAt: m.created_at || m.createdAt,
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (member: Omit<Member, "id" | "points" | "createdAt">) => {
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      });
      if (!res.ok) throw new Error("Failed to add member");
      const newMember = await res.json();
      const transformed: Member = {
        id: newMember.id,
        name: newMember.name,
        avatar: newMember.avatar || "👤",
        color: newMember.color || "stone",
        role: newMember.role,
        points: newMember.points,
        createdAt: newMember.created_at || newMember.createdAt,
      };
      setMembers((prev) => [...prev, transformed]);
      return transformed;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const updateMember = async (id: string, updates: Partial<Omit<Member, "id" | "createdAt">>) => {
    try {
      const res = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      if (!res.ok) throw new Error("Failed to update member");
      const updated = await res.json();
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...updates,
                points: updated.points,
              }
            : m
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const removeMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove member");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const awardPoints = async (
    id: string,
    points: number,
    activityType?: string,
    activityName?: string
  ) => {
    try {
      const res = await fetch(`/api/members/${id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, activityType, activityName }),
      });
      if (!res.ok) throw new Error("Failed to award points");
      const updated = await res.json();
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, points: updated.points } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const getMember = (id: string) => members.find((m) => m.id === id);

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    addMember,
    updateMember,
    removeMember,
    awardPoints,
    getMember,
    // Backward compat
    isHydrated: !isLoading,
  };
}
