"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const prefixedKey = `treehouse:${key}`;

  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const stored = localStorage.getItem(prefixedKey);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const stored = localStorage.getItem(prefixedKey);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [prefixedKey]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    }
  }, [prefixedKey, value, isHydrated]);

  return [value, setValue, isHydrated] as const;
}
