"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STAT_INFO, StatType, STAT_TYPES } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Wizard steps
const STEPS = [
  "welcome",
  "not-a-chore-app",
  "meet-your-stats",
  "how-growth-works",
  "streaks-that-forgive",
  "your-journey",
  "ready",
] as const;

type Step = (typeof STEPS)[number];

// Custom colors - warm treehouse palette
const colors = {
  cream: "#FDF6E3",
  paper: "#FAF3E0",
  bark: "#5D4037",
  barkLight: "#8D6E63",
  forest: "#2E7D32",
  forestLight: "#4CAF50",
  amber: "#FF8F00",
  amberLight: "#FFB300",
  sky: "#4FC3F7",
  berry: "#C2185B",
  ink: "#263238",
  inkLight: "#546E7A",
};

export default function PrimerPage() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [selectedStat, setSelectedStat] = useState<StatType | null>(null);

  const stepIndex = STEPS.indexOf(currentStep);
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const next = () => {
    if (!isLast) {
      setCurrentStep(STEPS[stepIndex + 1]);
      setSelectedStat(null);
    }
  };

  const prev = () => {
    if (!isFirst) {
      setCurrentStep(STEPS[stepIndex - 1]);
      setSelectedStat(null);
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: colors.cream }}
    >
      {/* Subtle paper texture overlay */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Progress - stamp/sticker style */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto flex justify-center gap-2">
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              className="relative"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className={`w-8 h-8 rounded-full border-3 flex items-center justify-center text-sm font-black transition-all duration-300 ${
                  i < stepIndex
                    ? "border-forest bg-forest text-white"
                    : i === stepIndex
                    ? "border-amber bg-amber text-white scale-110"
                    : "border-bark/30 bg-cream text-bark/40"
                }`}
                style={{
                  borderColor: i < stepIndex ? colors.forest : i === stepIndex ? colors.amber : `${colors.bark}40`,
                  backgroundColor: i < stepIndex ? colors.forest : i === stepIndex ? colors.amber : colors.cream,
                  color: i <= stepIndex ? "white" : `${colors.bark}60`,
                }}
              >
                {i < stepIndex ? "✓" : i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20 max-w-lg min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-center"
          >
            {currentStep === "welcome" && <WelcomeStep />}
            {currentStep === "not-a-chore-app" && <NotAChoreAppStep />}
            {currentStep === "meet-your-stats" && (
              <MeetYourStatsStep
                selectedStat={selectedStat}
                onSelectStat={setSelectedStat}
              />
            )}
            {currentStep === "how-growth-works" && <HowGrowthWorksStep />}
            {currentStep === "streaks-that-forgive" && <StreaksThatForgiveStep />}
            {currentStep === "your-journey" && <YourJourneyStep />}
            {currentStep === "ready" && <ReadyStep />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 mt-auto">
          <button
            onClick={prev}
            disabled={isFirst}
            className="px-6 py-3 text-lg font-bold rounded-full transition-all disabled:opacity-0"
            style={{ color: colors.barkLight }}
          >
            ← Back
          </button>

          {isLast ? (
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 text-xl font-black rounded-full text-white shadow-lg"
                style={{
                  backgroundColor: colors.forest,
                  boxShadow: `0 4px 0 ${colors.bark}, 0 6px 20px ${colors.forest}40`
                }}
              >
                Let&apos;s Go! →
              </motion.button>
            </Link>
          ) : (
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-xl font-black rounded-full text-white shadow-lg"
              style={{
                backgroundColor: colors.amber,
                boxShadow: `0 4px 0 ${colors.bark}, 0 6px 20px ${colors.amber}40`
              }}
            >
              Next →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function WelcomeStep() {
  return (
    <div className="text-center space-y-8">
      {/* Treehouse illustration */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        className="relative inline-block"
      >
        <div
          className="text-[140px] leading-none"
          style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.1))" }}
        >
          🏡
        </div>
        {/* Little bird */}
        <motion.span
          className="absolute -top-2 right-0 text-4xl"
          animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🐦
        </motion.span>
      </motion.div>

      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black"
          style={{ color: colors.bark }}
        >
          Welcome to
          <br />
          <span style={{ color: colors.forest }}>Treehouse</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl"
          style={{ color: colors.inkLight }}
        >
          Your personal growth clubhouse.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="inline-block rounded-2xl px-6 py-3 border-2 border-dashed"
        style={{ borderColor: colors.barkLight, color: colors.bark }}
      >
        Let&apos;s show you around... 👋
      </motion.div>
    </div>
  );
}

function NotAChoreAppStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          🙅
        </motion.div>
        <h2 className="text-3xl font-black" style={{ color: colors.bark }}>
          This isn&apos;t a chore app.
        </h2>
        <p className="text-lg" style={{ color: colors.inkLight }}>
          It&apos;s a <span className="font-black" style={{ color: colors.forest }}>character builder</span>.
        </p>
      </div>

      <div className="space-y-3">
        <ComparisonRow
          bad="Do chores → Get points → Buy stuff"
          good="Do things → Grow as a person"
          delay={0.1}
        />
        <ComparisonRow
          bad="Compete with siblings"
          good="Track your own journey"
          delay={0.2}
        />
        <ComparisonRow
          bad="Never break your streak!"
          good="When you fall, get back up"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4 border-2"
        style={{ backgroundColor: `${colors.forest}10`, borderColor: `${colors.forest}30` }}
      >
        <p className="text-center" style={{ color: colors.forest }}>
          <span className="font-black">Our goal?</span> Help you become someone who doesn&apos;t need this app anymore. 🎓
        </p>
      </motion.div>
    </div>
  );
}

function ComparisonRow({ bad, good, delay }: { bad: string; good: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl p-3 flex gap-3 items-start"
      style={{ backgroundColor: colors.paper }}
    >
      <div className="flex-1">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.berry }}>
          ✗ Nope
        </span>
        <p className="text-sm line-through opacity-60" style={{ color: colors.ink }}>{bad}</p>
      </div>
      <div className="w-px self-stretch" style={{ backgroundColor: `${colors.bark}20` }} />
      <div className="flex-1">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.forest }}>
          ✓ Yes!
        </span>
        <p className="text-sm font-medium" style={{ color: colors.ink }}>{good}</p>
      </div>
    </motion.div>
  );
}

function MeetYourStatsStep({
  selectedStat,
  onSelectStat,
}: {
  selectedStat: StatType | null;
  onSelectStat: (stat: StatType | null) => void;
}) {
  const statStyles: Record<StatType, { bg: string; border: string; text: string }> = {
    grit: { bg: "#FFF3E0", border: "#FF9800", text: "#E65100" },
    wisdom: { bg: "#F3E5F5", border: "#9C27B0", text: "#6A1B9A" },
    heart: { bg: "#FCE4EC", border: "#E91E63", text: "#AD1457" },
    initiative: { bg: "#FFF8E1", border: "#FFC107", text: "#FF6F00" },
    temperance: { bg: "#E0F7FA", border: "#00BCD4", text: "#006064" },
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">
          📊
        </motion.div>
        <h2 className="text-3xl font-black" style={{ color: colors.bark }}>
          Your 5 Stats
        </h2>
        <p style={{ color: colors.inkLight }}>Tap to learn more!</p>
      </div>

      <div className="space-y-2">
        {STAT_TYPES.map((statType, index) => {
          const info = STAT_INFO[statType];
          const style = statStyles[statType];
          const isSelected = selectedStat === statType;

          return (
            <motion.div
              key={statType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onSelectStat(isSelected ? null : statType)}
              className="cursor-pointer"
            >
              <motion.div
                layout
                whileTap={{ scale: 0.98 }}
                className="rounded-xl p-3 border-2 transition-all"
                style={{
                  backgroundColor: isSelected ? style.bg : colors.paper,
                  borderColor: isSelected ? style.border : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg" style={{ color: style.text }}>
                        {info.name}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: style.border, color: "white" }}
                      >
                        LV.1
                      </span>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm mt-1"
                          style={{ color: colors.inkLight }}
                        >
                          {info.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <span style={{ color: style.border }}>{isSelected ? "▼" : "▶"}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-sm" style={{ color: colors.inkLight }}>
        Everyone&apos;s different. There&apos;s no &quot;best&quot; build! 🎮
      </p>
    </div>
  );
}

function HowGrowthWorksStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl">
          ⬆️
        </motion.div>
        <h2 className="text-3xl font-black" style={{ color: colors.bark }}>
          How You Level Up
        </h2>
        <p style={{ color: colors.inkLight }}>XP shows growth, not rewards</p>
      </div>

      <div className="space-y-3">
        <XPCard
          emoji="💪"
          action="Finished something hard"
          xp="+20"
          stat="Grit"
          color="#FF9800"
          delay={0.1}
        />
        <XPCard
          emoji="🧠"
          action="Did your daily check-in"
          xp="+10"
          stat="Wisdom"
          color="#9C27B0"
          delay={0.2}
        />
        <XPCard
          emoji="❤️"
          action="Helped without being asked"
          xp="+15"
          stat="Heart"
          color="#E91E63"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4 border-2"
        style={{ backgroundColor: `${colors.amber}15`, borderColor: colors.amber }}
      >
        <div className="flex gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <p className="font-black" style={{ color: colors.amber }}>Plot twist:</p>
            <p className="text-sm" style={{ color: colors.ink }}>
              You can&apos;t spend XP. It just shows you&apos;re growing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function XPCard({
  emoji,
  action,
  xp,
  stat,
  color,
  delay,
}: {
  emoji: string;
  action: string;
  xp: string;
  stat: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ backgroundColor: colors.paper }}
    >
      <span className="text-3xl">{emoji}</span>
      <p className="flex-1 text-sm" style={{ color: colors.ink }}>{action}</p>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring" }}
        className="font-black text-sm px-3 py-1 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        {xp} {stat}
      </motion.span>
    </motion.div>
  );
}

function StreaksThatForgiveStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl"
        >
          🔥
        </motion.div>
        <h2 className="text-3xl font-black" style={{ color: colors.bark }}>
          Streaks That Forgive
        </h2>
        <p style={{ color: colors.inkLight }}>The real skill isn&apos;t &quot;never miss&quot;</p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl p-5 text-center border-2"
        style={{ backgroundColor: `${colors.amber}10`, borderColor: colors.amber }}
      >
        <p className="text-2xl font-black" style={{ color: colors.amber }}>
          &quot;When you fall, get back up.&quot;
        </p>
        <p className="mt-1" style={{ color: colors.inkLight }}>
          That&apos;s the lesson. Not perfection.
        </p>
      </motion.div>

      <div className="space-y-2">
        <StreakRow emoji="🔥" label="Current Streak" value="5 days" sublabel="Days in a row" color={colors.amber} delay={0.2} />
        <StreakRow emoji="🏆" label="Best Streak" value="12 days" sublabel="Your record!" color={colors.forest} delay={0.3} />
        <StreakRow emoji="💪" label="Comebacks" value="3" sublabel="Times you got back up" color={colors.berry} delay={0.4} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center rounded-xl p-3"
        style={{ backgroundColor: `${colors.forest}10`, color: colors.forest }}
      >
        Miss a day? Come back for <span className="font-black">+15 Grit XP</span>! 💪
      </motion.p>
    </div>
  );
}

function StreakRow({
  emoji,
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  emoji: string;
  label: string;
  value: string;
  sublabel: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ backgroundColor: colors.paper }}
    >
      <span className="text-3xl">{emoji}</span>
      <div className="flex-1">
        <p className="font-bold" style={{ color: colors.ink }}>{label}</p>
        <p className="text-xs" style={{ color: colors.inkLight }}>{sublabel}</p>
      </div>
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
    </motion.div>
  );
}

function YourJourneyStep() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl">
          🗺️
        </motion.div>
        <h2 className="text-3xl font-black" style={{ color: colors.bark }}>
          Your Journey
        </h2>
        <p style={{ color: colors.inkLight }}>Where you&apos;re headed</p>
      </div>

      <div className="relative pl-6">
        {/* Path line */}
        <div
          className="absolute left-2 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: `${colors.bark}20` }}
        />

        <div className="space-y-4">
          <Milestone emoji="📍" level="Now" title="Getting Started" desc="Learning the ropes" active delay={0.1} />
          <Milestone emoji="🌱" level="Lv 5" title="Building Habits" desc="Finding your groove" delay={0.2} />
          <Milestone emoji="⭐" level="Lv 15" title="Self-Aware" desc="Know your strengths" delay={0.3} />
          <Milestone emoji="🎓" level="Lv 25+" title="Graduation" desc="You don't need us anymore!" final delay={0.4} />
        </div>
      </div>
    </div>
  );
}

function Milestone({
  emoji,
  level,
  title,
  desc,
  active,
  final,
  delay,
}: {
  emoji: string;
  level: string;
  title: string;
  desc: string;
  active?: boolean;
  final?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="relative flex gap-3 items-start"
    >
      <motion.div
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg -ml-3 border-2"
        style={{
          backgroundColor: active ? colors.amber : final ? colors.forest : colors.paper,
          borderColor: active ? colors.amber : final ? colors.forest : `${colors.bark}30`,
        }}
        animate={active ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {emoji}
      </motion.div>
      <div className="flex-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase" style={{ color: colors.inkLight }}>{level}</span>
          {active && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.amber }}>
              You&apos;re here!
            </span>
          )}
          {final && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.forest }}>
              🎉 Goal!
            </span>
          )}
        </div>
        <p className="font-bold" style={{ color: colors.ink }}>{title}</p>
        <p className="text-sm" style={{ color: colors.inkLight }}>{desc}</p>
      </div>
    </motion.div>
  );
}

function ReadyStep() {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        className="relative inline-block"
      >
        <span className="text-[100px] block" style={{ filter: "drop-shadow(4px 4px 0 rgba(0,0,0,0.1))" }}>
          🚀
        </span>
        {/* Sparkles */}
        {[...Array(4)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${30 + Math.sin(i * 90 * (Math.PI / 180)) * 35}%`,
              left: `${50 + Math.cos(i * 90 * (Math.PI / 180)) * 45}%`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          >
            ✨
          </motion.span>
        ))}
      </motion.div>

      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black"
          style={{ color: colors.forest }}
        >
          You&apos;re Ready!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg"
          style={{ color: colors.inkLight }}
        >
          Time to start your journey.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl p-5 text-left border-2"
        style={{ backgroundColor: colors.paper, borderColor: `${colors.bark}20` }}
      >
        <p className="font-black text-center mb-4" style={{ color: colors.bark }}>Quick Start 🎮</p>
        <div className="space-y-2">
          {[
            { emoji: "📝", text: "Log stuff you're proud of" },
            { emoji: "🧠", text: "Do quick daily check-ins" },
            { emoji: "🎯", text: "Use games to grind XP" },
            { emoji: "💪", text: "Come back after breaks" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl">{item.emoji}</span>
              <span style={{ color: colors.ink }}>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="font-bold"
        style={{ color: colors.forest }}
      >
        Less on chores. More on character. 🌳
      </motion.p>
    </div>
  );
}
