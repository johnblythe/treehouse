"use client";

import { useState, useEffect, useCallback } from "react";
import { ChoreSpinnerConfig, ChoreSlot } from "./types";
import { getRandomDecoys } from "./decoys";

const DEFAULT_CONFIG: ChoreSpinnerConfig = {
  realChores: [],
  pointsPerChore: 10,
};

export function useChoreSpinner() {
  const [config, setConfig] = useState<ChoreSpinnerConfig>(DEFAULT_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dbChores, setDbChores] = useState<Array<{ id: string; name: string; points: number }>>([]);

  // Load chores from DB on mount
  useEffect(() => {
    const loadChores = async () => {
      try {
        const res = await fetch("/api/items?type=chore");
        if (res.ok) {
          const items = await res.json();
          setDbChores(items.map((i: { id: string; name: string; points: number }) => ({
            id: i.id,
            name: i.name,
            points: i.points || 10,
          })));
          // If we have DB chores, use them as defaults
          if (items.length > 0) {
            setConfig(prev => ({
              ...prev,
              realChores: items.map((i: { name: string }) => i.name),
              pointsPerChore: items[0]?.points || 10,
            }));
          }
        }
      } catch {
        // Fall back to empty config
      }
      setIsHydrated(true);
    };
    loadChores();
  }, []);

  const setRealChores = (chores: string[]) => {
    setConfig({ ...config, realChores: chores });
  };

  const setPointsPerChore = (points: number) => {
    setConfig({ ...config, pointsPerChore: points });
  };

  const clearConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Save chores to DB
  const saveChores = useCallback(async (chores: string[]) => {
    for (const name of chores) {
      // Only add if not already in DB
      if (!dbChores.find(c => c.name === name)) {
        try {
          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "chore", name, points: config.pointsPerChore }),
          });
        } catch {
          // Ignore failures
        }
      }
    }
  }, [dbChores, config.pointsPerChore]);

  // Generate wheel slots (real chores + decoys)
  const generateSlots = (): ChoreSlot[] => {
    if (config.realChores.length === 0) return [];

    const totalSlots = 10;
    const decoyCount = totalSlots - config.realChores.length;
    const decoys = getRandomDecoys(decoyCount, config.realChores);

    // Create all slots
    const realSlots: ChoreSlot[] = config.realChores.map((name, i) => ({
      id: `real-${i}`,
      name,
      isReal: true,
      points: config.pointsPerChore,
    }));

    const decoySlots: ChoreSlot[] = decoys.map((name, i) => ({
      id: `decoy-${i}`,
      name,
      isReal: false,
      points: config.pointsPerChore,
    }));

    // Shuffle all slots together
    const allSlots = [...realSlots, ...decoySlots];
    return allSlots.sort(() => Math.random() - 0.5);
  };

  return {
    config,
    isHydrated,
    isConfigured: config.realChores.length > 0,
    dbChores,
    setRealChores,
    setPointsPerChore,
    clearConfig,
    generateSlots,
    saveChores,
  };
}
