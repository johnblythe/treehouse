"use client";

import { useState } from "react";
import { useFamily } from "@/hooks/useFamily";
import { useActivities } from "@/hooks/useActivities";
import { MemberList } from "@/components/family";
import { ActivityFeed, PointsToast, usePointsToast } from "@/components/points";
import { Leaderboard, LeaderboardReveal } from "@/components/leaderboard";
import { ChoreRoulette } from "@/components/micro-apps/chore-roulette";
import { DinnerPicker } from "@/components/micro-apps/dinner-picker";
import { seedFamily, clearFamily, seedActivities, clearActivities } from "@/lib/seed-data";
import { TreePine, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const isDev = process.env.NODE_ENV === "development";

export default function Home() {
  const { members, isHydrated, addMember, updateMember, removeMember, awardPoints, getMember } = useFamily();
  const { activities, addActivity, isHydrated: activitiesHydrated } = useActivities();
  const { toasts, showToast, dismissToast } = usePointsToast();
  const [showReveal, setShowReveal] = useState(false);
  const [showChoreRoulette, setShowChoreRoulette] = useState(false);
  const [showDinnerPicker, setShowDinnerPicker] = useState(false);

  const handlePointsAwarded = (memberId: string, points: number, activityName: string) => {
    awardPoints(memberId, points);
    
    addActivity({
      memberId,
      type: "chore",
      name: activityName,
      points,
    });

    const member = getMember(memberId);
    if (member) {
      showToast({
        memberName: member.name,
        memberAvatar: member.avatar,
        memberColor: member.color,
        points,
        activity: activityName,
      });
    }
  };

  if (!isHydrated || !activitiesHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse">
          <TreePine className="w-8 h-8 text-emerald-500" />
          <span className="text-xl font-bold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Leaderboard Reveal Modal */}
      {showReveal && members.length >= 2 && (
        <LeaderboardReveal 
          members={members} 
          onClose={() => setShowReveal(false)} 
        />
      )}

      {/* Chore Roulette Modal */}
      {showChoreRoulette && (
        <ChoreRoulette
          members={members}
          onPointsAwarded={handlePointsAwarded}
          onClose={() => setShowChoreRoulette(false)}
        />
      )}

      {/* Dinner Picker Modal */}
      {showDinnerPicker && (
        <DinnerPicker onClose={() => setShowDinnerPicker(false)} />
      )}

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <PointsToast
          key={toast.id}
          {...toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}

      {/* Header */}
      <header className="border-b-2 border-emerald-100 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-stone-800">
                Treehouse
              </h1>
            </div>
            
            {/* Reveal Rankings button in header */}
            {members.length >= 2 && members.some(m => m.points > 0) && (
              <Button
                onClick={() => setShowReveal(true)}
                variant="outline"
                className="rounded-xl font-semibold border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Reveal Rankings
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Responsive layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Main content */}
          <main className="flex-1 space-y-8">
            <MemberList
              members={members}
              onAdd={addMember}
              onUpdate={updateMember}
              onRemove={removeMember}
            />

            {/* Mobile: collapsible leaderboard + activity feed */}
            {members.length > 0 && (
              <div className="lg:hidden space-y-4">
                {members.some(m => m.points > 0) && (
                  <div className="bg-white/60 backdrop-blur-sm border-2 border-stone-200 rounded-2xl p-4">
                    <Leaderboard members={members} compact />
                  </div>
                )}
                {activities.length > 0 && (
                  <ActivityFeed
                    activities={activities}
                    members={members}
                    variant="inline"
                    defaultExpanded={false}
                  />
                )}
              </div>
            )}

            {/* Micro-Apps Grid */}
            {members.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-stone-800">Micro-Apps</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowChoreRoulette(true)}
                    className="micro-app-card p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  >
                    <span className="text-4xl block mb-3">🎰</span>
                    <span className="font-bold text-amber-700">Chore Roulette</span>
                    <span className="block text-xs text-amber-600 mt-1">Get lucky!</span>
                  </button>
                  <button
                    onClick={() => setShowDinnerPicker(true)}
                    className="micro-app-card p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 border-2 border-rose-200 text-center shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  >
                    <span className="text-4xl block mb-3">🍽️</span>
                    <span className="font-bold text-rose-700">Dinner Picker</span>
                    <span className="block text-xs text-rose-600 mt-1">Spin to decide!</span>
                  </button>
                  <button
                    disabled
                    className="micro-app-card p-6 rounded-2xl bg-white/80 backdrop-blur-sm text-center shadow-sm opacity-60 cursor-not-allowed"
                  >
                    <span className="text-4xl block mb-3">✅</span>
                    <span className="font-bold text-stone-700">Checklist</span>
                    <span className="block text-xs text-muted-foreground mt-1">Coming soon</span>
                  </button>
                  
                  {/* Dev: Test points button */}
                  {isDev && members.length > 0 && (
                    <button
                      onClick={() => {
                        const randomMember = members[Math.floor(Math.random() * members.length)];
                        const testActivities = ["Made bed", "Brushed teeth", "Did homework", "Fed pet", "Cleaned room"];
                        const randomActivity = testActivities[Math.floor(Math.random() * testActivities.length)];
                        const randomPoints = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
                        handlePointsAwarded(randomMember.id, randomPoints, randomActivity);
                      }}
                      className="micro-app-card p-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 text-center shadow-sm border-2 border-violet-200"
                    >
                      <span className="text-4xl block mb-3">🧪</span>
                      <span className="font-bold text-violet-700">Test Points</span>
                      <span className="block text-xs text-violet-500 mt-1">Dev only</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Desktop: sidebar with leaderboard + activity feed */}
          {members.length > 0 && (
            <aside className="hidden lg:block w-80 shrink-0 space-y-4">
              {/* Leaderboard */}
              {members.some(m => m.points > 0) && (
                <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-stone-200 p-5 shadow-sm">
                  <Leaderboard members={members} />
                </div>
              )}
              
              {/* Activity Feed */}
              <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-stone-200 p-5 max-h-[calc(100vh-20rem)] overflow-hidden shadow-sm" style={{ top: members.some(m => m.points > 0) ? 'auto' : '6rem' }}>
                <ActivityFeed
                  activities={activities}
                  members={members}
                  variant="sidebar"
                />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Dev controls */}
      {isDev && (
        <footer className="fixed bottom-4 right-4 flex gap-2 flex-wrap justify-end z-30">
          <button
            onClick={seedFamily}
            className="px-4 py-2 text-xs font-semibold bg-sky-500 text-white rounded-xl hover:bg-sky-600 shadow-md transition-all hover:scale-105"
          >
            Seed Family
          </button>
          <button
            onClick={() => seedActivities(members)}
            className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md transition-all hover:scale-105"
          >
            Seed Activities
          </button>
          <button
            onClick={() => { clearFamily(); clearActivities(); }}
            className="px-4 py-2 text-xs font-semibold bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-md transition-all hover:scale-105"
          >
            Clear All
          </button>
        </footer>
      )}
    </div>
  );
}
