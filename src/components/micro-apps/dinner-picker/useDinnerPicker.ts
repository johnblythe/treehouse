"use client";

import { useState, useEffect, useCallback } from "react";
import { Meal, DinnerPickerConfig } from "./types";

const DEFAULT_CONFIG: DinnerPickerConfig = {
  meals: [],
};

export function useDinnerPicker() {
  const [config, setConfig] = useState<DinnerPickerConfig>(DEFAULT_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dbMeals, setDbMeals] = useState<Meal[]>([]);

  // Load meals from DB on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const res = await fetch("/api/items?type=dinner_option");
        if (res.ok) {
          const items = await res.json();
          const meals: Meal[] = items.map((i: { id: string; name: string; emoji?: string }) => ({
            id: i.id,
            name: i.name,
            emoji: i.emoji || "🍽️",
          }));
          setDbMeals(meals);
          // If we have DB meals, use them as defaults
          if (meals.length > 0) {
            setConfig(prev => ({ ...prev, meals }));
          }
        }
      } catch {
        // Fall back to empty config
      }
      setIsHydrated(true);
    };
    loadMeals();
  }, []);

  const setMeals = (meals: Meal[]) => {
    setConfig(prev => ({ ...prev, meals }));
  };

  const clearConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Save meals to DB
  const saveMeals = useCallback(async (meals: Meal[]) => {
    for (const meal of meals) {
      // Only add if not already in DB
      if (!dbMeals.find(m => m.name === meal.name)) {
        try {
          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "dinner_option",
              name: meal.name,
              emoji: meal.emoji,
              points: 0,
            }),
          });
        } catch {
          // Ignore failures
        }
      }
    }
  }, [dbMeals]);

  const isConfigured = config.meals.length >= 2;

  return {
    config,
    isHydrated,
    isConfigured,
    dbMeals,
    setMeals,
    clearConfig,
    saveMeals,
  };
}
