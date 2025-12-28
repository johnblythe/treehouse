"use client";

import { useState, useEffect, useCallback } from "react";

export interface Item {
  id: string;
  type: "chore" | "checklist_item" | "dinner_option";
  name: string;
  emoji?: string | null;
  points: number;
  difficulty?: "easy" | "medium" | "hard" | null;
  isDecoy?: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
}

export function useItems(type?: Item["type"]) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = type ? `/api/items?type=${type}` : "/api/items";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(
        data.map((item: Record<string, unknown>) => ({
          id: item.id,
          type: item.type,
          name: item.name,
          emoji: item.emoji,
          points: item.points,
          difficulty: item.difficulty,
          isDecoy: item.is_decoy ?? item.isDecoy,
          metadata: item.metadata,
          createdAt: item.created_at ?? item.createdAt,
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<Item, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add item");
      const newItem = await res.json();
      const transformed: Item = {
        id: newItem.id,
        type: newItem.type,
        name: newItem.name,
        emoji: newItem.emoji,
        points: newItem.points,
        difficulty: newItem.difficulty,
        isDecoy: newItem.is_decoy ?? newItem.isDecoy,
        metadata: newItem.metadata,
        createdAt: newItem.created_at ?? newItem.createdAt,
      };
      setItems((prev) => [...prev, transformed]);
      return transformed;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<Omit<Item, "id" | "createdAt">>) => {
    try {
      const res = await fetch("/api/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      const updated = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
              }
            : item
        )
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await fetch(`/api/items?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const getItem = (id: string) => items.find((item) => item.id === id);

  // Filter helpers
  const chores = items.filter((i) => i.type === "chore");
  const dinnerOptions = items.filter((i) => i.type === "dinner_option");
  const checklistItems = items.filter((i) => i.type === "checklist_item");

  return {
    items,
    chores,
    dinnerOptions,
    checklistItems,
    isLoading,
    error,
    refetch: fetchItems,
    addItem,
    updateItem,
    removeItem,
    getItem,
    isHydrated: !isLoading,
  };
}
