"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/useStats";
import { Member } from "@/lib/types";

const MOODS = [
  { value: 1, emoji: "😫", label: "rough" },
  { value: 2, emoji: "😐", label: "meh" },
  { value: 3, emoji: "🙂", label: "okay" },
  { value: 4, emoji: "😊", label: "good" },
  { value: 5, emoji: "🤩", label: "great" },
];

// Warm treehouse colors
const colors = {
  cream: "#FDF6E3",
  paper: "#FAF3E0",
  bark: "#5D4037",
  forest: "#2E7D32",
  amber: "#FF8F00",
  wisdom: { bg: "#F3E5F5", border: "#9C27B0", text: "#6A1B9A" },
};

interface DailyCheckInProps {
  members: Member[];
  onComplete: (xpGained: number) => void;
  onClose: () => void;
}

export function DailyCheckIn({ members, onComplete, onClose }: DailyCheckInProps) {
  // Filter to only children (parents don't need to check in)
  const kids = useMemo(() => members.filter((m) => m.role === "child"), [members]);

  // Auto-select if only one kid
  const [selectedMember, setSelectedMember] = useState<Member | null>(
    kids.length === 1 ? kids[0] : null
  );

  // If no kids, show message
  if (kids.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          style={{ backgroundColor: colors.paper }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold" style={{ color: colors.bark }}>
              Daily Check-in
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center text-muted-foreground">
            Add some family members first!
          </p>
        </motion.div>
      </div>
    );
  }

  // Member selection screen
  if (!selectedMember) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          style={{ backgroundColor: colors.paper }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-extrabold flex items-center gap-2"
              style={{ color: colors.bark }}
            >
              <span className="text-2xl">🧠</span>
              Daily Check-in
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-center text-muted-foreground mb-6">Who&apos;s checking in?</p>

          <div className="grid grid-cols-2 gap-3">
            {kids.map((kid) => (
              <motion.button
                key={kid.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMember(kid)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all",
                  "bg-white hover:border-purple-300"
                )}
                style={{ borderColor: colors.wisdom.border + "40" }}
              >
                <span className="text-4xl block mb-2">{kid.avatar}</span>
                <span className="font-bold" style={{ color: colors.bark }}>
                  {kid.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Check-in form
  return <CheckInForm member={selectedMember} onComplete={onComplete} onClose={onClose} />;
}

// Extracted form component
interface CheckInFormProps {
  member: Member;
  onComplete: (xpGained: number) => void;
  onClose: () => void;
}

function CheckInForm({ member, onComplete, onClose }: CheckInFormProps) {
  const { logCheckIn } = useStats(member.id);
  const [mood, setMood] = useState<number | null>(null);
  const [proudOf, setProudOf] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!mood || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await logCheckIn(mood, proudOf.trim() || undefined);
      setShowSuccess(true);
      setTimeout(() => {
        onComplete(10);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to save check-in:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.paper }}
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <SuccessAnimation key="success" />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-extrabold flex items-center gap-2"
                  style={{ color: colors.bark }}
                >
                  <span className="text-2xl">🧠</span>
                  Daily Check-in
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Member greeting */}
              <p className="text-center text-muted-foreground mb-6">
                Hey {member.name}! How was your day?
              </p>

              {/* Mood selector */}
              <div className="mb-6">
                <div className="flex justify-center gap-2">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.value}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setMood(m.value)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-2xl transition-all",
                        "border-2 border-transparent",
                        mood === m.value && "border-purple-500 bg-purple-50"
                      )}
                      style={
                        mood === m.value
                          ? {
                              borderColor: colors.wisdom.border,
                              backgroundColor: colors.wisdom.bg,
                            }
                          : {}
                      }
                    >
                      <span className="text-4xl mb-1">{m.emoji}</span>
                      <span className="text-xs font-medium" style={{ color: colors.bark }}>
                        {m.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Proud of input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.bark }}>
                  One thing you&apos;re proud of today{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={proudOf}
                    onChange={(e) => setProudOf(e.target.value.slice(0, 500))}
                    placeholder="I helped my sister with homework..."
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 border-stone-200",
                      "focus:outline-none focus:border-purple-400",
                      "resize-none text-sm"
                    )}
                    style={{ backgroundColor: colors.cream }}
                    disabled={isSubmitting}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {proudOf.length}/500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 rounded-xl"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!mood || isSubmitting}
                  className={cn(
                    "flex-1 h-12 rounded-xl font-bold text-lg",
                    "bg-gradient-to-r from-purple-500 to-purple-600",
                    "hover:from-purple-600 hover:to-purple-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      Save
                      <span className="ml-2 text-purple-200">+10 🧠</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function SuccessAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.6, 1] }}
        className="text-6xl mb-4"
      >
        ✨
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-extrabold mb-2"
        style={{ color: colors.bark }}
      >
        Nice!
      </motion.h3>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          backgroundColor: colors.wisdom.bg,
          color: colors.wisdom.text,
        }}
      >
        <span className="text-xl">+10</span>
        <span className="text-xl">🧠</span>
        <span className="font-bold">Wisdom</span>
      </motion.div>
    </motion.div>
  );
}

export default DailyCheckIn;
