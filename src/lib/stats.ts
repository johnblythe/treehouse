// Character Development System - Stats & XP Logic
// Based on docs/SOUL.md and docs/MVP.md

// ============================================
// STAT TYPES
// ============================================

export const STAT_TYPES = ['grit', 'wisdom', 'heart', 'initiative', 'temperance'] as const;
export type StatType = typeof STAT_TYPES[number];

export const STAT_INFO: Record<StatType, {
  emoji: string;
  name: string;
  description: string;
  color: string; // for avatar/UI
}> = {
  grit: {
    emoji: '💪',
    name: 'Grit',
    description: 'Doing hard things, resilience, bouncing back',
    color: 'orange', // warm, strong
  },
  wisdom: {
    emoji: '🧠',
    name: 'Wisdom',
    description: 'Self-awareness, reflection, learning from mistakes',
    color: 'purple', // thoughtful
  },
  heart: {
    emoji: '❤️',
    name: 'Heart',
    description: 'Kindness, helping others, empathy',
    color: 'pink', // warm, caring
  },
  initiative: {
    emoji: '⚡',
    name: 'Initiative',
    description: 'Acting without being asked, noticing needs',
    color: 'yellow', // bright, active
  },
  temperance: {
    emoji: '⚖️',
    name: 'Temperance',
    description: 'Self-control, delayed gratification, patience',
    color: 'blue', // calm, balanced
  },
};

// ============================================
// ACTIVITY TYPES & XP VALUES
// ============================================

export const ACTIVITY_TYPES = ['self_report', 'check_in', 'micro_app', 'bounce_back'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

// Base XP values for different activities
export const XP_VALUES = {
  // Self-report logging
  self_report: {
    base: 15,
    hardBonus: 5, // "Was this hard for you?" = yes
    descriptionBonus: 5, // Added custom description
  },
  // Daily check-in
  check_in: {
    base: 10,
  },
  // Micro-apps (grinding)
  micro_app: {
    chore_spinner: 20, // → grit
    dinner_picker: 10, // → heart
  },
  // Bounce-back (returning after lapse)
  bounce_back: {
    base: 15, // → grit
  },
} as const;

// Self-report presets with default stat mappings
export const SELF_REPORT_PRESETS = [
  { id: 'helped_someone', label: 'I helped someone', stat: 'heart' as StatType },
  { id: 'without_asking', label: 'I did something without being asked', stat: 'initiative' as StatType },
  { id: 'saved_money', label: 'I saved money / didn\'t buy something', stat: 'temperance' as StatType },
  { id: 'told_truth', label: 'I told the truth about something hard', stat: 'grit' as StatType },
  { id: 'stayed_calm', label: 'I stayed calm when upset', stat: 'temperance' as StatType },
  { id: 'finished_hard', label: 'I finished something I didn\'t want to', stat: 'grit' as StatType },
] as const;

export type SelfReportPreset = typeof SELF_REPORT_PRESETS[number];

// ============================================
// LEVEL CALCULATION
// ============================================

// XP thresholds for each level (exponential curve)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Formula: 50 * (level^1.5)
  // This creates a gentle curve that gets harder but not impossibly so
  return Math.floor(50 * Math.pow(level, 1.5));
}

// Calculate level from XP
export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

// Calculate progress to next level (0-100%)
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  return Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);
}

// ============================================
// OVERALL LEVEL
// ============================================

// Overall level is the average of all stat levels
export function getOverallLevel(statLevels: number[]): number {
  if (statLevels.length === 0) return 1;
  const sum = statLevels.reduce((a, b) => a + b, 0);
  return Math.floor(sum / statLevels.length);
}

// ============================================
// STAT UTILITIES
// ============================================

export interface StatData {
  statType: StatType;
  currentXp: number;
  level: number;
}

export interface StatsSnapshot {
  stats: Record<StatType, StatData>;
  overallLevel: number;
  totalXp: number;
}

// Create initial stats for a new member
export function createInitialStats(memberId: string): Omit<StatData, 'level'>[] {
  return STAT_TYPES.map(statType => ({
    statType,
    currentXp: 0,
  }));
}

// Get the highest stat (for avatar primary color)
export function getHighestStat(stats: Record<StatType, StatData>): StatType {
  let highest: StatType = 'grit';
  let highestXp = 0;

  for (const [statType, data] of Object.entries(stats)) {
    if (data.currentXp > highestXp) {
      highestXp = data.currentXp;
      highest = statType as StatType;
    }
  }

  return highest;
}

// Get second highest stat (for avatar secondary color)
export function getSecondHighestStat(stats: Record<StatType, StatData>): StatType {
  const sorted = Object.entries(stats)
    .sort(([, a], [, b]) => b.currentXp - a.currentXp);

  return (sorted[1]?.[0] ?? sorted[0]?.[0]) as StatType;
}

// ============================================
// LEVEL THRESHOLDS REFERENCE
// ============================================

// For reference, here are XP requirements for levels 1-30:
// Level 1:   0 XP
// Level 2:   100 XP
// Level 3:   260 XP
// Level 4:   400 XP
// Level 5:   559 XP
// Level 10:  1581 XP
// Level 15:  2905 XP
// Level 20:  4472 XP
// Level 25:  6250 XP
// Level 30:  8216 XP

// At ~20 XP per activity, reaching level 10 in one stat takes ~80 activities
// Spread across 5 stats, that's 400 activities total for overall level 10
// At 2-3 activities per day, that's 4-6 months of engagement
