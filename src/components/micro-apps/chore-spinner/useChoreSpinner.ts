"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChoreSpinnerConfig, ChoreSlot } from "./types";
import { getRandomDecoys } from "./decoys";

const DEFAULT_CONFIG: ChoreSpinnerConfig = {
  realChores: [],
  pointsPerChore: 10,
};

export function useChoreSpinner() {
  const [config, setConfig, isHydrated] = useLocalStorage<ChoreSpinnerConfig>(
    "chore-spinner-config",
    DEFAULT_CONFIG
  );

  const setRealChores = (chores: string[]) => {
    setConfig({ ...config, realChores: chores });
  };

  const setPointsPerChore = (points: number) => {
    setConfig({ ...config, pointsPerChore: points });
  };

  const clearConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

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
    setRealChores,
    setPointsPerChore,
    clearConfig,
    generateSlots,
  };
}
