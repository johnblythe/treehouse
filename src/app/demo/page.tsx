"use client";

import { useState } from "react";
import { MysteryBox, SwipePicker, BracketBattle, PIRWheel, PickerOption } from "@/components/pickers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Swords, Target, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member } from "@/lib/types";

// Demo options
const DEMO_OPTIONS: PickerOption[] = [
  { id: "1", name: "Pizza Night", emoji: "🍕" },
  { id: "2", name: "Taco Tuesday", emoji: "🌮" },
  { id: "3", name: "Sushi Time", emoji: "🍱" },
  { id: "4", name: "Burger Bash", emoji: "🍔" },
  { id: "5", name: "Pasta Party", emoji: "🍝" },
  { id: "6", name: "BBQ Feast", emoji: "🍖" },
  { id: "7", name: "Chinese Food", emoji: "🥡" },
  { id: "8", name: "Indian Curry", emoji: "🍛" },
];

// Demo family members
const DEMO_MEMBERS: Member[] = [
  { id: "m1", name: "Dad", avatar: "👨", color: "blue", role: "parent", points: 150, createdAt: "" },
  { id: "m2", name: "Mom", avatar: "👩", color: "pink", role: "parent", points: 200, createdAt: "" },
  { id: "m3", name: "Alex", avatar: "🧒", color: "green", role: "child", points: 75, createdAt: "" },
  { id: "m4", name: "Sam", avatar: "👧", color: "purple", role: "child", points: 90, createdAt: "" },
];

type PickerType = "mystery" | "swipe" | "bracket" | "pir" | null;

export default function DemoPage() {
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [lastResult, setLastResult] = useState<PickerOption | null>(null);

  const handleResult = (winner: PickerOption) => {
    setLastResult(winner);
    // Keep picker open to show result, user can go back
  };

  const goBack = () => {
    setActivePicker(null);
    setLastResult(null);
  };

  // Render active picker
  if (activePicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-4">
        <Button
          onClick={goBack}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pickers
        </Button>

        <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur">
          {activePicker === "mystery" && (
            <MysteryBox
              options={DEMO_OPTIONS}
              onResult={handleResult}
              onCancel={goBack}
            />
          )}
          {activePicker === "swipe" && (
            <SwipePicker
              options={DEMO_OPTIONS}
              familyMembers={DEMO_MEMBERS}
              requiredVotes={2}
              onResult={handleResult}
              onCancel={goBack}
            />
          )}
          {activePicker === "bracket" && (
            <BracketBattle
              options={DEMO_OPTIONS}
              familyMembers={DEMO_MEMBERS}
              onResult={handleResult}
              onCancel={goBack}
            />
          )}
          {activePicker === "pir" && (
            <PIRWheel
              options={DEMO_OPTIONS}
              onResult={handleResult}
              onCancel={goBack}
            />
          )}
        </Card>

        {lastResult && (
          <div className="mt-6 text-center">
            <p className="text-stone-600">
              Last result: <span className="font-bold">{lastResult.emoji} {lastResult.name}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Picker selection grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-stone-800 text-center mb-2">
          Picker Components Demo
        </h1>
        <p className="text-stone-500 text-center mb-8">
          Test all four picker components with demo data
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mystery Box */}
          <button
            onClick={() => setActivePicker("mystery")}
            className={cn(
              "group p-8 rounded-3xl border-2 transition-all text-left",
              "bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200",
              "hover:border-purple-400 hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">Mystery Box</h2>
                <p className="text-sm text-stone-500">Issue #7</p>
              </div>
            </div>
            <p className="text-stone-600">
              Three mystery boxes shuffle around. Pick one for a dramatic reveal!
            </p>
          </button>

          {/* Swipe Picker */}
          <button
            onClick={() => setActivePicker("swipe")}
            className={cn(
              "group p-8 rounded-3xl border-2 transition-all text-left",
              "bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200",
              "hover:border-pink-400 hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">Swipe Picker</h2>
                <p className="text-sm text-stone-500">Issue #8</p>
              </div>
            </div>
            <p className="text-stone-600">
              Tinder-style voting. Family members swipe YES/NO until consensus.
            </p>
          </button>

          {/* Bracket Battle */}
          <button
            onClick={() => setActivePicker("bracket")}
            className={cn(
              "group p-8 rounded-3xl border-2 transition-all text-left",
              "bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200",
              "hover:border-orange-400 hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Swords className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">Bracket Battle</h2>
                <p className="text-sm text-stone-500">Issue #9</p>
              </div>
            </div>
            <p className="text-stone-600">
              Tournament-style elimination. Options face off until one champion remains!
            </p>
          </button>

          {/* PIR Wheel */}
          <button
            onClick={() => setActivePicker("pir")}
            className={cn(
              "group p-8 rounded-3xl border-2 transition-all text-left",
              "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200",
              "hover:border-amber-400 hover:shadow-xl hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">Big Wheel</h2>
                <p className="text-sm text-stone-500">Issue #10</p>
              </div>
            </div>
            <p className="text-stone-600">
              Price Is Right style vertical wheel with tick sounds and dramatic spin!
            </p>
          </button>
        </div>

        {/* Demo data info */}
        <div className="mt-12 p-6 rounded-2xl bg-white/50 border border-stone-200">
          <h3 className="font-bold text-stone-700 mb-3">Demo Data</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-stone-600 mb-2">Options:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_OPTIONS.map((opt) => (
                  <span key={opt.id} className="px-2 py-1 bg-stone-100 rounded">
                    {opt.emoji} {opt.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-stone-600 mb-2">Family Members:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_MEMBERS.map((m) => (
                  <span key={m.id} className="px-2 py-1 bg-stone-100 rounded">
                    {m.avatar} {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
