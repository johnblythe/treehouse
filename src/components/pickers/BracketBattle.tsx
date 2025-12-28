"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { VotingPickerProps, PickerOption } from "./types";
import { useVoting } from "@/hooks/useVoting";
import confetti from "canvas-confetti";
import { Swords, Crown, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "setup" | "voting" | "result";

interface Matchup {
  id: string;
  round: number;
  option1: PickerOption;
  option2: PickerOption;
  votes: Record<string, string>; // memberId -> optionId voted for
  winner?: PickerOption;
}

interface BracketState {
  rounds: Matchup[][];
  currentRound: number;
  currentMatchup: number;
  currentVoterIndex: number;
}

export function BracketBattle({
  options,
  familyMembers,
  onResult,
  onCancel,
}: VotingPickerProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [bracket, setBracket] = useState<BracketState | null>(null);
  const [winner, setWinner] = useState<PickerOption | null>(null);
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [votingOption, setVotingOption] = useState<string | null>(null);

  const { createSession, castVote, completeSession } = useVoting();

  // Build initial bracket from options (pad to power of 2 if needed)
  const buildBracket = useCallback((opts: PickerOption[]): Matchup[][] => {
    // Shuffle options
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    
    // Pad to nearest power of 2
    let bracketSize = 2;
    while (bracketSize < shuffled.length) bracketSize *= 2;
    while (shuffled.length < bracketSize) {
      shuffled.push({ id: `bye-${shuffled.length}`, name: "BYE", emoji: "➖" });
    }

    // Create first round matchups
    const firstRound: Matchup[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      firstRound.push({
        id: `r0-m${i / 2}`,
        round: 0,
        option1: shuffled[i],
        option2: shuffled[i + 1],
        votes: {},
      });
    }

    // Calculate total rounds needed
    const totalRounds = Math.log2(bracketSize);
    const rounds: Matchup[][] = [firstRound];

    // Create empty matchup slots for subsequent rounds
    for (let r = 1; r < totalRounds; r++) {
      const roundMatchups: Matchup[] = [];
      const matchupsInRound = bracketSize / Math.pow(2, r + 1);
      for (let m = 0; m < matchupsInRound; m++) {
        roundMatchups.push({
          id: `r${r}-m${m}`,
          round: r,
          option1: { id: "tbd", name: "TBD", emoji: "❓" },
          option2: { id: "tbd", name: "TBD", emoji: "❓" },
          votes: {},
        });
      }
      rounds.push(roundMatchups);
    }

    return rounds;
  }, []);

  // Determine winner of a matchup
  const getMatchupWinner = (matchup: Matchup, voters: string[]): PickerOption | null => {
    // BYE auto-wins
    if (matchup.option1.id.startsWith("bye")) return matchup.option2;
    if (matchup.option2.id.startsWith("bye")) return matchup.option1;

    // Count votes
    let votes1 = 0;
    let votes2 = 0;
    for (const voterId of voters) {
      if (matchup.votes[voterId] === matchup.option1.id) votes1++;
      if (matchup.votes[voterId] === matchup.option2.id) votes2++;
    }

    // All voters must have voted
    if (votes1 + votes2 < voters.length) return null;

    // Winner by majority (tie goes to option1 for now)
    return votes1 >= votes2 ? matchup.option1 : matchup.option2;
  };

  // Handle vote
  const handleVote = async (optionId: string) => {
    if (!bracket || votingOption) return;

    const currentMatchup = bracket.rounds[bracket.currentRound][bracket.currentMatchup];
    const currentVoter = selectedVoters[bracket.currentVoterIndex];

    setVotingOption(optionId);

    // Record vote in DB
    try {
      await castVote(currentVoter, optionId, "pick", bracket.currentRound);
    } catch {
      // Continue anyway
    }

    setTimeout(() => {
      setBracket((prev) => {
        if (!prev) return prev;

        const newRounds = [...prev.rounds.map((r) => [...r.map((m) => ({ ...m, votes: { ...m.votes } }))])];
        const matchup = newRounds[prev.currentRound][prev.currentMatchup];
        matchup.votes[currentVoter] = optionId;

        // Check if all voters have voted on this matchup
        const resolvedWinner = getMatchupWinner(matchup, selectedVoters);

        if (resolvedWinner) {
          matchup.winner = resolvedWinner;

          // Advance winner to next round
          if (prev.currentRound < newRounds.length - 1) {
            const nextRound = prev.currentRound + 1;
            const nextMatchupIndex = Math.floor(prev.currentMatchup / 2);
            const nextMatchup = newRounds[nextRound][nextMatchupIndex];
            
            if (prev.currentMatchup % 2 === 0) {
              nextMatchup.option1 = resolvedWinner;
            } else {
              nextMatchup.option2 = resolvedWinner;
            }
          }

          // Move to next matchup in this round, or next round
          const nextMatchupInRound = prev.currentMatchup + 1;
          if (nextMatchupInRound < newRounds[prev.currentRound].length) {
            setVotingOption(null);
            return {
              ...prev,
              rounds: newRounds,
              currentMatchup: nextMatchupInRound,
              currentVoterIndex: 0,
            };
          }

          // Move to next round
          const nextRound = prev.currentRound + 1;
          if (nextRound < newRounds.length) {
            setVotingOption(null);
            return {
              ...prev,
              rounds: newRounds,
              currentRound: nextRound,
              currentMatchup: 0,
              currentVoterIndex: 0,
            };
          }

          // Tournament complete!
          setWinner(resolvedWinner);
          setPhase("result");
          completeSession(resolvedWinner);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#fbbf24", "#a855f7", "#ec4899"],
          });
          setTimeout(() => onResult(resolvedWinner), 2500);
          return prev;
        }

        // Move to next voter
        setVotingOption(null);
        return {
          ...prev,
          rounds: newRounds,
          currentVoterIndex: prev.currentVoterIndex + 1,
        };
      });
    }, 400);
  };

  const startTournament = async () => {
    if (selectedVoters.length < 1) return;

    const rounds = buildBracket(options);

    try {
      await createSession("bracket", options, { voters: selectedVoters, rounds: rounds.length });
    } catch {
      // Continue anyway
    }

    // Auto-advance BYE matchups
    const processedRounds = [...rounds];
    for (let m = 0; m < processedRounds[0].length; m++) {
      const matchup = processedRounds[0][m];
      if (matchup.option1.id.startsWith("bye") || matchup.option2.id.startsWith("bye")) {
        const winner = matchup.option1.id.startsWith("bye") ? matchup.option2 : matchup.option1;
        matchup.winner = winner;
        
        // Advance to next round
        if (processedRounds.length > 1) {
          const nextMatchupIndex = Math.floor(m / 2);
          const nextMatchup = processedRounds[1][nextMatchupIndex];
          if (m % 2 === 0) {
            nextMatchup.option1 = winner;
          } else {
            nextMatchup.option2 = winner;
          }
        }
      }
    }

    // Find first non-bye matchup
    let startMatchup = 0;
    while (startMatchup < processedRounds[0].length && processedRounds[0][startMatchup].winner) {
      startMatchup++;
    }

    // If all first round are byes, start at round 2
    let startRound = 0;
    if (startMatchup >= processedRounds[0].length) {
      startRound = 1;
      startMatchup = 0;
    }

    setBracket({
      rounds: processedRounds,
      currentRound: startRound,
      currentMatchup: startMatchup,
      currentVoterIndex: 0,
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

  const currentVoter = bracket ? familyMembers.find((m) => m.id === selectedVoters[bracket.currentVoterIndex]) : null;
  const currentMatchup = bracket ? bracket.rounds[bracket.currentRound][bracket.currentMatchup] : null;

  // Setup phase
  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="flex items-center gap-2">
          <Swords className="w-7 h-7 text-orange-500" />
          <h2 className="text-2xl font-extrabold text-stone-800">Bracket Battle</h2>
        </div>
        <p className="text-stone-500 text-center">
          {options.length} options enter, 1 winner emerges!
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => toggleVoter(member.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                selectedVoters.includes(member.id)
                  ? "border-orange-500 bg-orange-50"
                  : "border-stone-200 hover:border-stone-300"
              )}
            >
              <span className="text-2xl">{member.avatar}</span>
              <span className="font-medium">{member.name}</span>
              {selectedVoters.includes(member.id) && (
                <Check className="w-5 h-5 text-orange-500 ml-auto" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={startTournament}
            disabled={selectedVoters.length < 1}
            size="lg"
            className="rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500"
          >
            <Swords className="w-5 h-5 mr-2" />
            Start Tournament!
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
        <Crown className="w-20 h-20 text-amber-500 animate-bounce" />
        <h2 className="text-3xl font-extrabold text-stone-800">Champion!</h2>
        <div className="text-8xl">{winner.emoji || "🏆"}</div>
        <p className="text-2xl font-bold text-stone-700">{winner.name}</p>
      </div>
    );
  }

  // Voting phase
  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Current voter */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span className="text-2xl">{currentVoter?.avatar}</span>
        <span className="font-medium">{currentVoter?.name}&apos;s vote</span>
        <span className="text-stone-400">
          (Round {(bracket?.currentRound || 0) + 1})
        </span>
      </div>

      {/* Matchup */}
      {currentMatchup && (
        <div className="flex items-center gap-4">
          {/* Option 1 */}
          <button
            onClick={() => handleVote(currentMatchup.option1.id)}
            disabled={!!votingOption}
            className={cn(
              "w-36 h-48 rounded-2xl border-4 flex flex-col items-center justify-center gap-3 transition-all",
              "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200",
              "hover:border-blue-500 hover:shadow-lg hover:scale-105",
              votingOption === currentMatchup.option1.id && "border-blue-500 scale-105 ring-4 ring-blue-300"
            )}
          >
            <span className="text-5xl">{currentMatchup.option1.emoji || "🔵"}</span>
            <span className="font-bold text-stone-800 text-center px-2">
              {currentMatchup.option1.name}
            </span>
          </button>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-stone-400">VS</span>
            <Swords className="w-8 h-8 text-orange-400 mt-1" />
          </div>

          {/* Option 2 */}
          <button
            onClick={() => handleVote(currentMatchup.option2.id)}
            disabled={!!votingOption}
            className={cn(
              "w-36 h-48 rounded-2xl border-4 flex flex-col items-center justify-center gap-3 transition-all",
              "bg-gradient-to-br from-rose-50 to-pink-100 border-rose-200",
              "hover:border-rose-500 hover:shadow-lg hover:scale-105",
              votingOption === currentMatchup.option2.id && "border-rose-500 scale-105 ring-4 ring-rose-300"
            )}
          >
            <span className="text-5xl">{currentMatchup.option2.emoji || "🔴"}</span>
            <span className="font-bold text-stone-800 text-center px-2">
              {currentMatchup.option2.name}
            </span>
          </button>
        </div>
      )}

      {/* Mini bracket preview */}
      {bracket && (
        <div className="flex items-center gap-2 text-xs text-stone-400 mt-4">
          {bracket.rounds.map((round, ri) => (
            <div key={ri} className="flex items-center gap-1">
              <div className={cn(
                "px-2 py-1 rounded",
                ri === bracket.currentRound ? "bg-orange-100 text-orange-700" : "bg-stone-100"
              )}>
                R{ri + 1}: {round.filter(m => m.winner).length}/{round.length}
              </div>
              {ri < bracket.rounds.length - 1 && <ChevronRight className="w-3 h-3" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
