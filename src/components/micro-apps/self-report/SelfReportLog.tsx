"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/useStats";
import { Member } from "@/lib/types";
import {
  StatType,
  STAT_INFO,
  STAT_TYPES,
  XP_VALUES,
  SelfReportPreset,
} from "@/lib/stats";

// Warm treehouse colors (from DailyCheckIn)
const colors = {
  cream: "#FDF6E3",
  paper: "#FAF3E0",
  bark: "#5D4037",
  forest: "#2E7D32",
  amber: "#FF8F00",
  self_report: { bg: "#FFF3E0", border: "#FF8F00", text: "#E65100" },
};

interface SelfReportLogProps {
  members: Member[];
  onComplete: (xpGained: number) => void;
  onClose: () => void;
}

export function SelfReportLog({ members, onComplete, onClose }: SelfReportLogProps) {
  // Filter to only children
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
              Log a Win
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.paper }}
      >
        <SelfReportForm
          kids={kids}
          selectedMember={selectedMember}
          onSelectMember={setSelectedMember}
          onComplete={onComplete}
          onClose={onClose}
        />
      </motion.div>
    </div>
  );
}

interface SelfReportFormProps {
  kids: Member[];
  selectedMember: Member | null;
  onSelectMember: (member: Member) => void;
  onComplete: (xpGained: number) => void;
  onClose: () => void;
}

function SelfReportForm({
  kids,
  selectedMember,
  onSelectMember,
  onComplete,
  onClose,
}: SelfReportFormProps) {
  const { logPreset, logActivity, presets, statInfo } = useStats(selectedMember?.id ?? null);

  // Form state
  const [selectedPreset, setSelectedPreset] = useState<SelfReportPreset | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [customStat, setCustomStat] = useState<StatType>("grit");
  const [description, setDescription] = useState("");
  const [wasHard, setWasHard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [statEarned, setStatEarned] = useState<StatType>("grit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // XP preview calculation
  const xpPreview =
    XP_VALUES.self_report.base +
    (wasHard ? XP_VALUES.self_report.hardBonus : 0) +
    (description.trim() ? XP_VALUES.self_report.descriptionBonus : 0);

  // Current stat for preview
  const currentStat = isCustom
    ? customStat
    : selectedPreset?.stat ?? "grit";

  const handlePresetSelect = (preset: SelfReportPreset) => {
    setSelectedPreset(preset);
    setIsCustom(false);
  };

  const handleCustomSelect = () => {
    setSelectedPreset(null);
    setIsCustom(true);
  };

  const handleBack = () => {
    setSelectedPreset(null);
    setIsCustom(false);
    setDescription("");
    setWasHard(false);
  };

  const handleSubmit = async () => {
    if (!selectedMember || isSubmitting) return;

    // Validation for custom: description required
    if (isCustom && !description.trim()) return;

    setIsSubmitting(true);
    try {
      let earnedXp = xpPreview;
      if (isCustom) {
        const result = await logActivity({
          activityType: "self_report",
          statAffected: customStat,
          description: description.trim(),
          wasHard,
        });
        earnedXp = result?.xpGained ?? xpPreview;
        setStatEarned(customStat);
      } else if (selectedPreset) {
        const result = await logPreset(
          selectedPreset.id,
          wasHard,
          description.trim() || undefined
        );
        earnedXp = result?.xpGained ?? xpPreview;
        setStatEarned(selectedPreset.stat);
      }

      setXpEarned(earnedXp);
      setShowSuccess(true);
      setTimeout(() => {
        onComplete(earnedXp);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to log self-report:", err);
      setIsSubmitting(false);
    }
  };

  // Show success animation
  if (showSuccess) {
    return <SuccessAnimation xp={xpEarned} stat={statEarned} />;
  }

  // Step 2: Details form (after preset or custom selected)
  if (selectedPreset || isCustom) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2
              className="text-xl font-extrabold flex items-center gap-2"
              style={{ color: colors.bark }}
            >
              <span className="text-2xl">{statInfo[currentStat]?.emoji}</span>
              {isCustom ? "Something Else" : selectedPreset?.label}
            </h2>
          </div>
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

        {/* Custom: stat selector */}
        {isCustom && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: colors.bark }}>
              Which stat does this build?
            </label>
            <select
              value={customStat}
              onChange={(e) => setCustomStat(e.target.value as StatType)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 border-stone-200",
                "focus:outline-none focus:border-amber-400",
                "text-base"
              )}
              style={{ backgroundColor: colors.cream }}
              disabled={isSubmitting}
            >
              {STAT_TYPES.map((stat) => (
                <option key={stat} value={stat}>
                  {statInfo[stat].emoji} {statInfo[stat].name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: colors.bark }}>
            {isCustom ? "What did you do?" : "Details"}{" "}
            <span className="text-muted-foreground font-normal">
              {isCustom ? "(required)" : "(optional, +5 XP)"}
            </span>
          </label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder={
                isCustom
                  ? "I did something I'm proud of..."
                  : "Add more details about what you did..."
              }
              rows={3}
              className={cn(
                "w-full px-4 py-3 rounded-xl border-2 border-stone-200",
                "focus:outline-none focus:border-amber-400",
                "resize-none text-base"
              )}
              style={{ backgroundColor: colors.cream }}
              disabled={isSubmitting}
            />
            {description.length > 150 && (
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {description.length}/200
              </span>
            )}
          </div>
        </div>

        {/* Was this hard toggle */}
        <div className="mb-6">
          <label
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
              wasHard
                ? "border-amber-400 bg-amber-50"
                : "border-stone-200 bg-white hover:border-amber-200"
            )}
          >
            <div>
              <span className="font-medium" style={{ color: colors.bark }}>
                Was this hard for you?
              </span>
              <span className="text-sm text-muted-foreground ml-2">+5 XP</span>
            </div>
            <input
              type="checkbox"
              checked={wasHard}
              onChange={(e) => setWasHard(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
              disabled={isSubmitting}
            />
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex-1 rounded-xl"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(isCustom && !description.trim()) || isSubmitting}
            className={cn(
              "flex-1 h-12 rounded-xl font-bold text-lg",
              "bg-gradient-to-r from-amber-500 to-orange-500",
              "hover:from-amber-600 hover:to-orange-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                Log It!
                <span className="ml-2 text-amber-100">
                  +{xpPreview} {statInfo[currentStat]?.emoji}
                </span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Step 1: Preset selection grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with member dropdown */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-extrabold flex items-center gap-2"
          style={{ color: colors.bark }}
        >
          <span className="text-2xl">✨</span>
          Log a Win
        </h2>
        <div className="flex items-center gap-2">
          {/* Member dropdown (only if multiple kids) */}
          {kids.length > 1 && (
            <select
              value={selectedMember?.id ?? ""}
              onChange={(e) => {
                const kid = kids.find((k) => k.id === e.target.value);
                if (kid) onSelectMember(kid);
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl border-2 border-stone-200 text-sm font-medium",
                "focus:outline-none focus:border-amber-400"
              )}
              style={{ backgroundColor: colors.cream, color: colors.bark }}
            >
              {!selectedMember && <option value="">Who's logging?</option>}
              {kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.avatar} {kid.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Prompt to select member if needed */}
      {kids.length > 1 && !selectedMember && (
        <p className="text-center text-muted-foreground mb-6">
          Select who's logging a win above
        </p>
      )}

      {/* Preset grid */}
      <div className={cn("space-y-2", !selectedMember && kids.length > 1 && "opacity-50 pointer-events-none")}>
        {presets.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePresetSelect(preset as SelfReportPreset)}
            disabled={!selectedMember}
            className={cn(
              "w-full p-4 rounded-xl border-2 border-stone-200 text-left transition-all",
              "bg-white hover:border-amber-300 hover:bg-amber-50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="mr-3">{statInfo[preset.stat]?.emoji}</span>
            <span className="font-medium" style={{ color: colors.bark }}>
              {preset.label}
            </span>
          </motion.button>
        ))}

        {/* Custom option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCustomSelect}
          disabled={!selectedMember}
          className={cn(
            "w-full p-4 rounded-xl border-2 border-dashed border-stone-300 text-left transition-all",
            "bg-stone-50 hover:border-amber-300 hover:bg-amber-50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span className="mr-3">✏️</span>
          <span className="font-medium text-muted-foreground">Something else...</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

interface SuccessAnimationProps {
  xp: number;
  stat: StatType;
}

function SuccessAnimation({ xp, stat }: SuccessAnimationProps) {
  const statData = STAT_INFO[stat];

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
          backgroundColor: colors.self_report.bg,
          color: colors.self_report.text,
        }}
      >
        <span className="text-xl">+{xp}</span>
        <span className="text-xl">{statData.emoji}</span>
        <span className="font-bold">{statData.name}</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        You noticed yourself growing
      </motion.p>
    </motion.div>
  );
}

export default SelfReportLog;
