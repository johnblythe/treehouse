"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoreSetupProps {
  onComplete: (chores: string[]) => void;
  initialChores?: string[];
}

export function ChoreSetup({ onComplete, initialChores = [] }: ChoreSetupProps) {
  const [chores, setChores] = useState<string[]>(
    initialChores.length > 0 ? initialChores : ["", "", ""]
  );

  const addChore = () => {
    if (chores.length < 5) {
      setChores([...chores, ""]);
    }
  };

  const removeChore = (index: number) => {
    if (chores.length > 1) {
      setChores(chores.filter((_, i) => i !== index));
    }
  };

  const updateChore = (index: number, value: string) => {
    const updated = [...chores];
    updated[index] = value;
    setChores(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validChores = chores.filter(c => c.trim() !== "");
    if (validChores.length > 0) {
      onComplete(validChores);
    }
  };

  const validCount = chores.filter(c => c.trim() !== "").length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-300 to-orange-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-stone-800">Set Up Chores</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the real chores. We&apos;ll add some &quot;decoys&quot; to make these feel like a win!
        </p>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold">Real Chores (1-5)</Label>
        {chores.map((chore, index) => (
          <div key={index} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={chore}
                onChange={(e) => updateChore(index, e.target.value)}
                placeholder={`Chore ${index + 1}...`}
                className="h-12 rounded-xl pr-10"
              />
              <span className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-lg",
                chore.trim() ? "opacity-100" : "opacity-30"
              )}>
                {chore.trim() ? "✓" : "○"}
              </span>
            </div>
            {chores.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeChore(index)}
                className="h-12 w-12 rounded-xl text-stone-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {chores.length < 5 && (
        <Button
          type="button"
          variant="outline"
          onClick={addChore}
          className="w-full rounded-xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Chore
        </Button>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          disabled={validCount === 0}
          className="w-full h-12 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg"
        >
          Ready to Spin! ({validCount} chore{validCount !== 1 ? "s" : ""})
        </Button>
      </div>
    </form>
  );
}
