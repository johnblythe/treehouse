"use client";

import { useState } from "react";
import { Meal } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealSetupProps {
  onComplete: (meals: Meal[]) => void;
  initialMeals?: Meal[];
}

const FOOD_EMOJIS = ["🍕", "🌮", "🍔", "🍝", "🍜", "🍣", "🥗", "🍛", "🥡", "🌯", "🍱", "🥘"];

const MEAL_SUGGESTIONS = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Tacos", emoji: "🌮" },
  { name: "Burgers", emoji: "🍔" },
  { name: "Pasta", emoji: "🍝" },
  { name: "Ramen", emoji: "🍜" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Salad", emoji: "🥗" },
  { name: "Curry", emoji: "🍛" },
  { name: "Chinese", emoji: "🥡" },
  { name: "Burritos", emoji: "🌯" },
  { name: "Stir Fry", emoji: "🥘" },
  { name: "Sandwiches", emoji: "🥪" },
];

export function MealSetup({ onComplete, initialMeals }: MealSetupProps) {
  const [meals, setMeals] = useState<Meal[]>(
    initialMeals?.length 
      ? initialMeals 
      : [{ id: crypto.randomUUID(), name: "", emoji: "🍽️" }]
  );

  const addMeal = () => {
    if (meals.length < 12) {
      const randomEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
      setMeals([...meals, { id: crypto.randomUUID(), name: "", emoji: randomEmoji }]);
    }
  };

  const removeMeal = (id: string) => {
    if (meals.length > 2) {
      setMeals(meals.filter(m => m.id !== id));
    }
  };

  const updateMeal = (id: string, name: string) => {
    setMeals(meals.map(m => m.id === id ? { ...m, name } : m));
  };

  const updateEmoji = (id: string, emoji: string) => {
    setMeals(meals.map(m => m.id === id ? { ...m, emoji } : m));
  };

  const quickFill = () => {
    const shuffled = [...MEAL_SUGGESTIONS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 6);
    setMeals(selected.map(s => ({ id: crypto.randomUUID(), name: s.name, emoji: s.emoji })));
  };

  const isValid = meals.length >= 2 && meals.every(m => m.name.trim().length > 0);

  const handleSubmit = () => {
    if (isValid) {
      onComplete(meals.map(m => ({ ...m, name: m.name.trim() })));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Add 2-12 dinner options, then spin to decide!
        </p>
      </div>

      {/* Quick fill button */}
      <Button
        variant="outline"
        onClick={quickFill}
        className="w-full rounded-xl border-dashed"
      >
        <Shuffle className="w-4 h-4 mr-2" />
        Quick fill with suggestions
      </Button>

      {/* Meal list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {meals.map((meal, index) => (
          <div key={meal.id} className="flex gap-2 items-center">
            {/* Emoji picker */}
            <select
              value={meal.emoji}
              onChange={(e) => updateEmoji(meal.id, e.target.value)}
              className="h-10 w-14 text-xl text-center rounded-xl border border-input bg-background"
            >
              {FOOD_EMOJIS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            
            <Input
              value={meal.name}
              onChange={(e) => updateMeal(meal.id, e.target.value)}
              placeholder={`Option ${index + 1}...`}
              className="flex-1 rounded-xl"
            />
            
            {meals.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMeal(meal.id)}
                className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {meals.length < 12 && (
        <Button
          variant="outline"
          onClick={addMeal}
          className="w-full rounded-xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add option ({meals.length}/12)
        </Button>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-lg",
          "bg-gradient-to-r from-amber-500 to-orange-600",
          "hover:from-amber-600 hover:to-orange-700",
          "disabled:opacity-50"
        )}
      >
        {meals.length < 2 ? "Add at least 2 options" : "Let's Spin!"}
      </Button>
    </div>
  );
}
