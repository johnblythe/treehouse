"use client";

import { useState, useCallback } from "react";
import { Meal } from "./types";
import { MealSetup } from "./MealSetup";
import { PIRWheel } from "./PIRWheel";
import { useDinnerPicker } from "./useDinnerPicker";
import { Button } from "@/components/ui/button";
import { Settings, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "setup" | "spin" | "result";

interface DinnerPickerProps {
  onClose: () => void;
}

export function DinnerPicker({ onClose }: DinnerPickerProps) {
  const { config, isHydrated, isConfigured, setMeals, clearConfig } = useDinnerPicker();
  
  const [phase, setPhase] = useState<Phase>(isConfigured ? "spin" : "setup");
  const [result, setResult] = useState<Meal | null>(null);

  const handleSetupComplete = (meals: Meal[]) => {
    setMeals(meals);
    setPhase("spin");
  };

  const handleResult = useCallback((meal: Meal) => {
    setResult(meal);
    setPhase("result");
  }, []);

  const handleSpinAgain = () => {
    setResult(null);
    setPhase("spin");
  };

  const handleReconfigure = () => {
    clearConfig();
    setResult(null);
    setPhase("setup");
  };

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            Dinner Picker
          </h2>
          <div className="flex items-center gap-2">
            {phase !== "setup" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReconfigure}
                className="rounded-xl"
                title="Change options"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Setup Phase */}
        {phase === "setup" && (
          <MealSetup
            onComplete={handleSetupComplete}
            initialMeals={config.meals.length > 0 ? config.meals : undefined}
          />
        )}

        {/* Spin Phase */}
        {phase === "spin" && config.meals.length >= 2 && (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground text-sm">
              What&apos;s for dinner? Let fate decide!
            </p>
            <PIRWheel
              meals={config.meals}
              onResult={handleResult}
            />
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && result && (
          <div className="space-y-6 text-center">
            <div>
              <p className="text-muted-foreground mb-2">Tonight&apos;s dinner is...</p>
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300">
                <span className="text-4xl">{result.emoji}</span>
                <span className="text-2xl font-extrabold text-amber-800">{result.name}</span>
              </div>
            </div>

            <p className="text-4xl">🎉</p>

            <div className="space-y-3">
              <Button
                onClick={handleSpinAgain}
                variant="outline"
                className="w-full rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Spin Again
              </Button>

              <Button
                onClick={onClose}
                className={cn(
                  "w-full h-12 rounded-xl font-bold text-lg",
                  "bg-gradient-to-r from-emerald-500 to-green-600",
                  "hover:from-emerald-600 hover:to-green-700"
                )}
              >
                Sounds Good!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
