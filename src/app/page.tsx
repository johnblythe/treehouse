"use client";

import { useFamily } from "@/hooks/useFamily";
import { MemberList } from "@/components/family";
import { seedFamily, clearFamily } from "@/lib/seed-data";

const isDev = process.env.NODE_ENV === "development";

export default function Home() {
  const { members, isHydrated, addMember, updateMember, removeMember } = useFamily();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-black">
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-black/80 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🏠</span>
            Treehouse
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <MemberList
          members={members}
          onAdd={addMember}
          onUpdate={updateMember}
          onRemove={removeMember}
        />

        {members.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Micro-Apps</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled
                className="p-6 rounded-2xl bg-muted text-center opacity-50 cursor-not-allowed"
              >
                <span className="text-3xl block mb-2">🎰</span>
                <span className="font-medium">Chore Spinner</span>
                <span className="block text-xs text-muted-foreground mt-1">Coming soon</span>
              </button>
              <button
                disabled
                className="p-6 rounded-2xl bg-muted text-center opacity-50 cursor-not-allowed"
              >
                <span className="text-3xl block mb-2">🍽️</span>
                <span className="font-medium">Dinner Picker</span>
                <span className="block text-xs text-muted-foreground mt-1">Coming soon</span>
              </button>
              <button
                disabled
                className="p-6 rounded-2xl bg-muted text-center opacity-50 cursor-not-allowed"
              >
                <span className="text-3xl block mb-2">✅</span>
                <span className="font-medium">Daily Checklist</span>
                <span className="block text-xs text-muted-foreground mt-1">Coming soon</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {isDev && (
        <footer className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={seedFamily}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Seed Family
          </button>
          <button
            onClick={clearFamily}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            Clear
          </button>
        </footer>
      )}
    </div>
  );
}
