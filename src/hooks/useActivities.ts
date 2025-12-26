"use client";

import { useLocalStorage } from "./useLocalStorage";
import { Activity } from "@/lib/types";

export function useActivities() {
  const [activities, setActivities, isHydrated] = useLocalStorage<Activity[]>("activities", []);

  const addActivity = (activity: Omit<Activity, "id" | "completedAt">) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
    };
    // Prepend new activities (most recent first)
    setActivities([newActivity, ...activities]);
    return newActivity;
  };

  const getActivitiesForMember = (memberId: string) => {
    return activities.filter(a => a.memberId === memberId);
  };

  const getRecentActivities = (limit: number = 20) => {
    return activities.slice(0, limit);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return {
    activities,
    isHydrated,
    addActivity,
    getActivitiesForMember,
    getRecentActivities,
    clearActivities,
  };
}
