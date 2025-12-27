"use client";

import { useState, useEffect } from "react";
import { Meal, DinnerPickerConfig } from "./types";

const STORAGE_KEY = "treehouse-dinner-picker";

const DEFAULT_CONFIG: DinnerPickerConfig = {
  meals: [],
};

export function useDinnerPicker() {
  const [config, setConfig] = useState<DinnerPickerConfig>(DEFAULT_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        // Invalid JSON, use default
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isHydrated]);

  const setMeals = (meals: Meal[]) => {
    setConfig(prev => ({ ...prev, meals }));
  };

  const clearConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const isConfigured = config.meals.length >= 2;

  return {
    config,
    isHydrated,
    isConfigured,
    setMeals,
    clearConfig,
  };
}
