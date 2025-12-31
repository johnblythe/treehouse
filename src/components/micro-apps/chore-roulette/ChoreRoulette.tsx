"use client";

import { useState, useMemo, useCallback } from "react";
import { Member } from "@/lib/types";
import { RouletteSlot, RouletteChore } from "./types";
import { ChoreSetup } from "./ChoreSetup";
import { MemberSelector } from "./MemberSelector";
import { RouletteGrid } from "./RouletteGrid";
import { getRandomDecoys } from "./decoys";
import { Button } from "@/components/ui/button";
import { Settings, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/useStats";

type Phase = "setup" | "select-member" | "roulette" | "result";

interface ChoreRouletteProps {
  members: Member[];
  onPointsAwarded: (memberId: string, points: number, activity: string) => void;
  onClose: () => void;
}

interface ChoreInput {
  name: string;
  points: number;
}

const TOTAL_SLOTS = 10;

export function ChoreRoulette({ members, onPointsAwarded, onClose }: ChoreRouletteProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [realChores, setRealChores] = useState<ChoreInput[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [slots, setSlots] = useState<RouletteSlot[]>([]);

  // XP system integration
  const { logMicroApp } = useStats(selectedMemberId);

  const selectedMember = useMemo(
    () => members.find(m => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  const totalPoints = useMemo(
    () => realChores.reduce((sum, c) => sum + c.points, 0),
    [realChores]
  );

  const generateSlots = useCallback((): RouletteSlot[] => {
    const decoyCount = TOTAL_SLOTS - realChores.length;
    const decoyNames = getRandomDecoys(decoyCount, realChores.map(c => c.name));
    
    // Create all chores
    const allChores: RouletteChore[] = [
      ...realChores.map((c, i) => ({
        id: `real-${i}`,
        name: c.name,
        isReal: true,
        points: c.points,
      })),
      ...decoyNames.map((name, i) => ({
        id: `decoy-${i}`,
        name,
        isReal: false,
        points: 0,
      })),
    ];

    // Shuffle positions
    const shuffled = allChores.sort(() => Math.random() - 0.5);

    // Create slots
    return shuffled.map((chore, i) => ({
      id: `slot-${i}`,
      chore,
      state: "shuffling" as const,
    }));
  }, [realChores]);

  const handleSetupComplete = (chores: ChoreInput[]) => {
    setRealChores(chores);
    setPhase("select-member");
  };

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(id);
  };

  const handleStartRoulette = () => {
    const newSlots = generateSlots();
    setSlots(newSlots);
    setPhase("roulette");
  };

  const handleRouletteComplete = useCallback(() => {
    setPhase("result");
  }, []);

  const handleAcceptChores = async () => {
    if (selectedMember) {
      // Award points for each real chore (legacy system)
      realChores.forEach(chore => {
        onPointsAwarded(selectedMember.id, chore.points, chore.name);
      });

      // Log to XP system → +20 Grit
      try {
        await logMicroApp(
          "chore_spinner",
          "grit",
          `Completed ${realChores.length} chore${realChores.length > 1 ? "s" : ""}`
        );
      } catch (err) {
        console.error("Failed to log XP:", err);
      }
    }
    onClose();
  };

  const handleNewRound = () => {
    setSelectedMemberId(null);
    setSlots([]);
    setPhase("select-member");
  };

  const handleReconfigure = () => {
    setRealChores([]);
    setSelectedMemberId(null);
    setSlots([]);
    setPhase("setup");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            Chore Roulette
          </h2>
          <div className="flex items-center gap-2">
            {phase !== "setup" && phase !== "roulette" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReconfigure}
                className="rounded-xl"
                title="Change chores"
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
          <ChoreSetup onComplete={handleSetupComplete} />
        )}

        {/* Select Member Phase */}
        {phase === "select-member" && (
          <div className="space-y-6">
            <MemberSelector
              members={members}
              selectedId={selectedMemberId}
              onSelect={handleMemberSelect}
            />

            <div className="text-center text-sm text-muted-foreground">
              <span className="font-medium">{realChores.length}</span> real chores hidden among{" "}
              <span className="font-medium">{TOTAL_SLOTS - realChores.length}</span> decoys
            </div>

            <Button
              onClick={handleStartRoulette}
              disabled={!selectedMemberId}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-lg shadow-lg",
                "bg-gradient-to-r from-amber-400 to-orange-500",
                "hover:from-amber-500 hover:to-orange-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Reveal Chores!
            </Button>
          </div>
        )}

        {/* Roulette Phase */}
        {phase === "roulette" && (
          <div className="space-y-4">
            {selectedMember && (
              <p className="text-center text-muted-foreground">
                <span className="font-semibold">{selectedMember.name}</span>&apos;s chores loading...
              </p>
            )}
            <RouletteGrid
              slots={slots}
              onComplete={handleRouletteComplete}
            />
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && selectedMember && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600 mb-1">
                Lucky {selectedMember.name}! 🍀
              </p>
              <p className="text-sm text-muted-foreground">
                You only got the easy ones!
              </p>
            </div>

            {/* Show final grid */}
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    slot.chore.isReal
                      ? "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400"
                      : "bg-stone-50 border-stone-200 opacity-50"
                  )}
                >
                  {slot.chore.isReal && (
                    <span className="text-sm">⭐</span>
                  )}
                  <span className={cn(
                    "block text-sm font-medium",
                    slot.chore.isReal ? "text-emerald-700" : "text-stone-400 line-through"
                  )}>
                    {slot.chore.name}
                  </span>
                  {slot.chore.isReal && (
                    <span className="text-xs text-emerald-600">+{slot.chore.points}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleAcceptChores}
                className={cn(
                  "w-full h-12 rounded-xl font-bold text-lg shadow-lg",
                  "bg-gradient-to-r from-emerald-500 to-green-600",
                  "hover:from-emerald-600 hover:to-green-700"
                )}
              >
                Accept Chores → +{totalPoints} pts
              </Button>

              <Button
                onClick={handleNewRound}
                variant="outline"
                className="w-full rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Round (Same Chores)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
