"use client";

import { useState, useMemo } from "react";
import { Member } from "@/lib/types";
import { ChoreSlot } from "./types";
import { ChoreSetup } from "./ChoreSetup";
import { SpinWheel } from "./SpinWheel";
import { MemberSelector } from "./MemberSelector";
import { SpinResult } from "./SpinResult";
import { useChoreSpinner } from "./useChoreSpinner";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "setup" | "select-member" | "spin" | "result";

interface ChoreSpinnerProps {
  members: Member[];
  onPointsAwarded: (memberId: string, points: number, activity: string) => void;
  onClose: () => void;
}

export function ChoreSpinner({ members, onPointsAwarded, onClose }: ChoreSpinnerProps) {
  const { 
    config, 
    isHydrated, 
    isConfigured, 
    setRealChores, 
    clearConfig,
    generateSlots 
  } = useChoreSpinner();

  const [phase, setPhase] = useState<Phase>(isConfigured ? "select-member" : "setup");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [slots, setSlots] = useState<ChoreSlot[]>([]);
  const [result, setResult] = useState<ChoreSlot | null>(null);

  const selectedMember = useMemo(
    () => members.find(m => m.id === selectedMemberId),
    [members, selectedMemberId]
  );

  // Initialize slots when entering spin phase
  const startSpin = () => {
    const newSlots = generateSlots();
    setSlots(newSlots);
    setPhase("spin");
  };

  const handleSetupComplete = (chores: string[]) => {
    setRealChores(chores);
    setPhase("select-member");
  };

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(id);
  };

  const handleSpinComplete = (slot: ChoreSlot) => {
    setResult(slot);
    setPhase("result");
  };

  const handleAccept = () => {
    if (result && selectedMember) {
      onPointsAwarded(selectedMember.id, result.points, result.name);
      // Reset for next spin
      setResult(null);
      setSelectedMemberId(null);
      setPhase("select-member");
    }
  };

  const handleSpinAgain = () => {
    setResult(null);
    startSpin();
  };

  const handleReconfigure = () => {
    clearConfig();
    setPhase("setup");
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-stone-800 flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            Chore Spinner
          </h2>
          <div className="flex items-center gap-2">
            {phase !== "setup" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReconfigure}
                className="rounded-xl"
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
          <ChoreSetup
            onComplete={handleSetupComplete}
            initialChores={config.realChores}
          />
        )}

        {/* Select Member Phase */}
        {phase === "select-member" && (
          <div className="space-y-6">
            <MemberSelector
              members={members}
              selectedId={selectedMemberId}
              onSelect={handleMemberSelect}
            />

            <Button
              onClick={startSpin}
              disabled={!selectedMemberId}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-lg shadow-lg",
                "bg-gradient-to-r from-amber-400 to-orange-500",
                "hover:from-amber-500 hover:to-orange-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Spin the Wheel!
            </Button>
          </div>
        )}

        {/* Spin Phase */}
        {phase === "spin" && (
          <div className="space-y-6">
            {selectedMember && (
              <p className="text-center text-muted-foreground">
                <span className="font-semibold">{selectedMember.name}</span> is spinning...
              </p>
            )}
            <SpinWheel
              slots={slots}
              onSpinComplete={handleSpinComplete}
            />
            <p className="text-center text-sm text-muted-foreground">
              Click the wheel to spin!
            </p>
          </div>
        )}

        {/* Result Phase */}
        {phase === "result" && result && selectedMember && (
          <SpinResult
            slot={result}
            member={selectedMember}
            onAccept={handleAccept}
            onSpinAgain={handleSpinAgain}
          />
        )}
      </div>
    </div>
  );
}
