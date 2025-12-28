"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity } from "@/lib/types";

export function useActivities(memberId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = memberId
        ? `/api/activities?memberId=${memberId}`
        : "/api/activities";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      // Transform DB format to app format
      setActivities(
        data.map((a: Record<string, unknown>) => ({
          id: a.id,
          memberId: a.member_id || a.memberId,
          type: a.type,
          name: a.name,
          points: a.points,
          completedAt: a.completed_at || a.completedAt,
          metadata: a.metadata,
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = async (activity: Omit<Activity, "id" | "completedAt">) => {
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (!res.ok) throw new Error("Failed to add activity");
      const newActivity = await res.json();
      const transformed: Activity = {
        id: newActivity.id,
        memberId: newActivity.member_id || newActivity.memberId,
        type: newActivity.type,
        name: newActivity.name,
        points: newActivity.points,
        completedAt: newActivity.completed_at || newActivity.completedAt,
        metadata: newActivity.metadata,
      };
      setActivities((prev) => [transformed, ...prev]);
      return transformed;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const getActivitiesForMember = (id: string) => {
    return activities.filter((a) => a.memberId === id);
  };

  const getRecentActivities = (limit: number = 20) => {
    return activities.slice(0, limit);
  };

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    addActivity,
    getActivitiesForMember,
    getRecentActivities,
    // Backward compat
    isHydrated: !isLoading,
  };
}
