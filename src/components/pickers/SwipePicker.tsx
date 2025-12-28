"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { VotingPickerProps, PickerOption } from "./types";
import { useVoting } from "@/hooks/useVoting";
import confetti from "canvas-confetti";
import { ThumbsUp, Users, Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "setup" | "voting" | "result";

interface SwipeState {
  currentOptionIndex: number;
  currentVoterIndex: number;
  optionVotes: Record<string, { yes: string[]; no: string[] }>; // optionId -> { yes: memberIds, no: memberIds }
}

export function SwipePicker({
  options,
  familyMembers,
  requiredVotes = 2,
  onResult,
  onCancel,
}: VotingPickerProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [swipeState, setSwipeState] = useState<SwipeState>({
    currentOptionIndex: 0,
    currentVoterIndex: 0,
    optionVotes: {},
  });
  const [winner, setWinner] = useState<PickerOption | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);

  const { createSession, castVote, completeSession } = useVoting();

  const currentOption = options[swipeState.currentOptionIndex];
  const currentVoter = familyMembers.find((m) => m.id === selectedVoters[swipeState.currentVoterIndex]);

  // Check if any option has enough YES votes
  const checkForWinner = useCallback(
    (votes: SwipeState["optionVotes"]) => {
      for (const optionId of Object.keys(votes)) {
        if (votes[optionId].yes.length >= requiredVotes) {
          return options.find((o) => o.id === optionId) || null;
        }
      }
      return null;
    },
    [options, requiredVotes]
  );

  // Handle swipe vote
  const handleSwipe = async (vote: "yes" | "no") => {
    if (!currentOption || !currentVoter) return;

    setSwipeDirection(vote === "yes" ? "right" : "left");

    // Try to record in DB (non-blocking for UX)
    try {
      await castVote(currentVoter.id, currentOption.id, vote);
    } catch {
      // Continue anyway for offline support
    }

    // Update local state
    setTimeout(() => {
      setSwipeState((prev) => {
        const newVotes = { ...prev.optionVotes };
        if (!newVotes[currentOption.id]) {
          newVotes[currentOption.id] = { yes: [], no: [] };
        }
        newVotes[currentOption.id][vote].push(currentVoter.id);

        // Check for winner
        const foundWinner = checkForWinner(newVotes);
        if (foundWinner) {
          setWinner(foundWinner);
          setPhase("result");
          completeSession(foundWinner);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          setTimeout(() => onResult(foundWinner), 2000);
          return prev;
        }

        // Move to next voter or next option
        const nextVoterIndex = prev.currentVoterIndex + 1;
        if (nextVoterIndex >= selectedVoters.length) {
          // All voters done with this option, move to next
          const nextOptionIndex = prev.currentOptionIndex + 1;
          if (nextOptionIndex >= options.length) {
            // All options done, pick the one with most YES votes
            let bestOption = options[0];
            let maxYes = 0;
            for (const opt of options) {
              const yesCount = newVotes[opt.id]?.yes.length || 0;
              if (yesCount > maxYes) {
                maxYes = yesCount;
                bestOption = opt;
              }
            }
            setWinner(bestOption);
            setPhase("result");
            completeSession(bestOption);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setTimeout(() => onResult(bestOption), 2000);
            return prev;
          }
          return {
            ...prev,
            optionVotes: newVotes,
            currentOptionIndex: nextOptionIndex,
            currentVoterIndex: 0,
          };
        }

        return {
          ...prev,
          optionVotes: newVotes,
          currentVoterIndex: nextVoterIndex,
        };
      });
      setSwipeDirection(null);
    }, 300);
  };

  const startVoting = async () => {
    if (selectedVoters.length < requiredVotes) return;

    try {
      await createSession("swipe", options, { requiredVotes, voters: selectedVoters });
    } catch {
      // Continue anyway
    }

    setSwipeState({
      currentOptionIndex: 0,
      currentVoterIndex: 0,
      optionVotes: {},
    });
    setPhase("voting");
  };

  const toggleVoter = (memberId: string) => {
    setSelectedVoters((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Setup phase - select voters
  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-2xl font-extrabold text-stone-800">Swipe Vote</h2>
        <p className="text-stone-500 text-center">
          Who&apos;s voting? Need {requiredVotes} YES votes to pick a winner!
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => toggleVoter(member.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                selectedVoters.includes(member.id)
                  ? "border-green-500 bg-green-50"
                  : "border-stone-200 hover:border-stone-300"
              )}
            >
              <span className="text-2xl">{member.avatar}</span>
              <span className="font-medium">{member.name}</span>
              {selectedVoters.includes(member.id) && (
                <Check className="w-5 h-5 text-green-500 ml-auto" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={startVoting}
            disabled={selectedVoters.length < requiredVotes}
            size="lg"
            className="rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500"
          >
            <Users className="w-5 h-5 mr-2" />
            Start Voting ({selectedVoters.length} voters)
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" className="rounded-xl">
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Result phase
  if (phase === "result" && winner) {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <Crown className="w-16 h-16 text-amber-500" />
        <h2 className="text-2xl font-extrabold text-stone-800">Winner!</h2>
        <div className="text-6xl">{winner.emoji || "🎉"}</div>
        <p className="text-xl font-bold text-stone-700">{winner.name}</p>
      </div>
    );
  }

  // Voting phase
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Current voter indicator */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span className="text-2xl">{currentVoter?.avatar}</span>
        <span className="font-medium">{currentVoter?.name}&apos;s turn</span>
        <span className="text-stone-400">
          ({swipeState.currentVoterIndex + 1}/{selectedVoters.length})
        </span>
      </div>

      {/* Swipe card */}
      <div
        className={cn(
          "relative w-72 h-96 rounded-3xl shadow-2xl transition-all duration-300",
          "bg-gradient-to-br from-white to-stone-50 border border-stone-200",
          swipeDirection === "right" && "translate-x-32 rotate-12 opacity-0",
          swipeDirection === "left" && "-translate-x-32 -rotate-12 opacity-0"
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <span className="text-7xl mb-4">{currentOption?.emoji || "❓"}</span>
          <h3 className="text-2xl font-bold text-stone-800 text-center">
            {currentOption?.name}
          </h3>
          <p className="text-stone-500 mt-4">
            Option {swipeState.currentOptionIndex + 1} of {options.length}
          </p>
        </div>

        {/* Swipe indicators */}
        <div
          className={cn(
            "absolute top-8 left-8 px-4 py-2 rounded-xl font-bold text-xl border-4 -rotate-12 transition-opacity",
            "border-red-500 text-red-500",
            swipeDirection === "left" ? "opacity-100" : "opacity-0"
          )}
        >
          NOPE
        </div>
        <div
          className={cn(
            "absolute top-8 right-8 px-4 py-2 rounded-xl font-bold text-xl border-4 rotate-12 transition-opacity",
            "border-green-500 text-green-500",
            swipeDirection === "right" ? "opacity-100" : "opacity-0"
          )}
        >
          LIKE
        </div>
      </div>

      {/* Vote buttons */}
      <div className="flex gap-8">
        <button
          onClick={() => handleSwipe("no")}
          className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          onClick={() => handleSwipe("yes")}
          className="w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
        >
          <ThumbsUp className="w-8 h-8 text-green-500" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {options.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              i === swipeState.currentOptionIndex
                ? "bg-pink-500"
                : i < swipeState.currentOptionIndex
                ? "bg-stone-400"
                : "bg-stone-200"
            )}
          />
        ))}
      </div>
    </div>
  );
}
