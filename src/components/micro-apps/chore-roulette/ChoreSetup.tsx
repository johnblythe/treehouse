"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoreInput {
  name: string;
  points: number;
}

interface ChoreSetupProps {
  onComplete: (chores: ChoreInput[]) => void;
  initialChores?: ChoreInput[];
}

const DEFAULT_POINTS = [5, 10, 15, 20, 25];

export function ChoreSetup({ onComplete, initialChores }: ChoreSetupProps) {
  const [chores, setChores] = useState<ChoreInput[]>(
    initialChores?.length ? initialChores : [{ name: "", points: 10 }]
  );

  const addChore = () => {
    if (chores.length < 5) {
      setChores([...chores, { name: "", points: 10 }]);
    }
  };

  const removeChore = (index: number) => {
    if (chores.length > 1) {
      setChores(chores.filter((_, i) => i !== index));
    }
  };

  const updateChore = (index: number, field: "name" | "points", value: string | number) => {
    const updated = [...chores];
    if (field === "name") {
      updated[index].name = value as string;
    } else {
      updated[index].points = value as number;
    }
    setChores(updated);
  };

  const isValid = chores.every(c => c.name.trim().length > 0) && chores.length >= 1;

  const handleSubmit = () => {
    if (isValid) {
      onComplete(chores.map(c => ({ name: c.name.trim(), points: c.points })));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Enter 1-5 real chores. The system will mix them with harder decoys!
        </p>
      </div>

      <div className="space-y-3">
        {chores.map((chore, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={chore.name}
              onChange={(e) => updateChore(index, "name", e.target.value)}
              placeholder={`Chore ${index + 1}...`}
              className="flex-1 rounded-xl"
            />
            <select
              value={chore.points}
              onChange={(e) => updateChore(index, "points", parseInt(e.target.value))}
              className="h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium"
            >
              {DEFAULT_POINTS.map(p => (
                <option key={p} value={p}>{p} pts</option>
              ))}
            </select>
            {chores.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeChore(index)}
                className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {chores.length < 5 && (
        <Button
          variant="outline"
          onClick={addChore}
          className="w-full rounded-xl border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another chore
        </Button>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-lg",
          "bg-gradient-to-r from-emerald-500 to-green-600",
          "hover:from-emerald-600 hover:to-green-700",
          "disabled:opacity-50"
        )}
      >
        Generate Chore Board
      </Button>
    </div>
  );
}
