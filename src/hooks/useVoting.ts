"use client";

import { useState, useEffect, useCallback } from "react";

export interface VotingOption {
  id: string;
  name: string;
  emoji?: string;
}

export interface Vote {
  id: string;
  sessionId: string;
  memberId: string;
  optionId: string;
  value?: string;
  round?: number;
  createdAt: string;
}

export interface VotingSession {
  id: string;
  type: "swipe" | "bracket" | "mystery_box" | "pir_wheel";
  status: "active" | "completed" | "cancelled";
  options: VotingOption[];
  config?: Record<string, unknown>;
  result?: VotingOption | VotingOption[];
  votes?: Vote[];
  createdAt: string;
  completedAt?: string;
}

export function useVoting(sessionId?: string) {
  const [session, setSession] = useState<VotingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session with votes
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/voting?id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      setSession({
        id: data.id,
        type: data.type,
        status: data.status,
        options: data.options,
        config: data.config,
        result: data.result,
        votes: data.votes,
        createdAt: data.created_at || data.createdAt,
        completedAt: data.completed_at || data.completedAt,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Create a new voting session
  const createSession = async (
    type: VotingSession["type"],
    options: VotingOption[],
    config?: Record<string, unknown>
  ): Promise<VotingSession> => {
    try {
      const res = await fetch("/api/voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, options, config }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      const newSession: VotingSession = {
        id: data.id,
        type: data.type,
        status: data.status,
        options: data.options,
        config: data.config,
        createdAt: data.created_at || data.createdAt,
      };
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Cast a vote
  const castVote = async (
    memberId: string,
    optionId: string,
    value?: string,
    round?: number
  ): Promise<{ vote: Vote; totalVotes: number; allVotes: Vote[] }> => {
    if (!session) throw new Error("No active session");
    try {
      const res = await fetch("/api/voting/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          memberId,
          optionId,
          value,
          round,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cast vote");
      }
      const data = await res.json();
      // Update local session with new votes
      setSession((prev) =>
        prev
          ? {
              ...prev,
              votes: data.allVotes,
            }
          : null
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Complete the session with a result
  const completeSession = async (result: VotingOption | VotingOption[]) => {
    if (!session) throw new Error("No active session");
    try {
      const res = await fetch("/api/voting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.id,
          status: "completed",
          result,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete session");
      const data = await res.json();
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
              result,
              completedAt: data.completed_at || data.completedAt,
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Cancel the session
  const cancelSession = async () => {
    if (!session) throw new Error("No active session");
    try {
      const res = await fetch("/api/voting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: session.id,
          status: "cancelled",
        }),
      });
      if (!res.ok) throw new Error("Failed to cancel session");
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
            }
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  // Get votes by member
  const getVotesForMember = (memberId: string) => {
    return session?.votes?.filter((v) => v.memberId === memberId) || [];
  };

  // Get votes by option
  const getVotesForOption = (optionId: string) => {
    return session?.votes?.filter((v) => v.optionId === optionId) || [];
  };

  // Check if member has voted on option
  const hasVoted = (memberId: string, optionId: string, round?: number) => {
    return session?.votes?.some(
      (v) =>
        v.memberId === memberId &&
        v.optionId === optionId &&
        (round === undefined || v.round === round)
    );
  };

  return {
    session,
    isLoading,
    error,
    refetch: fetchSession,
    createSession,
    castVote,
    completeSession,
    cancelSession,
    getVotesForMember,
    getVotesForOption,
    hasVoted,
  };
}
