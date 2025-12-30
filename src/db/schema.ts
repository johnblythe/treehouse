import { pgTable, text, integer, timestamp, uuid, jsonb, boolean, pgSchema } from "drizzle-orm/pg-core";

// Use a dedicated schema to avoid conflicts with other projects
export const treehouseSchema = pgSchema("treehouse");

// Family members (kids + parents)
export const members = treehouseSchema.table("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"), // emoji
  color: text("color"), // tailwind color key
  role: text("role").notNull().default("child"), // 'parent' | 'child'
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Completed activities (for history/leaderboard)
export const activities = treehouseSchema.table("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'chore' | 'checklist' | 'dinner_pick' | 'mystery_box' | 'bracket' | 'swipe'
  name: text("name").notNull(),
  points: integer("points").notNull().default(0),
  metadata: jsonb("metadata"), // flexible data per activity type
  completedAt: timestamp("completed_at").defaultNow(),
});

// Configurable items (chores, checklist items, dinner options)
export const items = treehouseSchema.table("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'chore' | 'checklist_item' | 'dinner_option'
  name: text("name").notNull(),
  emoji: text("emoji"),
  points: integer("points").notNull().default(1),
  difficulty: text("difficulty"), // 'easy' | 'medium' | 'hard'
  isDecoy: boolean("is_decoy").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Voting sessions for multi-device picker components
export const votingSessions = treehouseSchema.table("voting_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'swipe' | 'bracket' | 'mystery_box'
  status: text("status").notNull().default("active"), // 'active' | 'completed' | 'cancelled'
  options: jsonb("options").notNull(), // array of { id, name, emoji? }
  config: jsonb("config"), // type-specific config (e.g., votes needed for swipe)
  result: jsonb("result"), // winner(s) when completed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Individual votes within a session
export const votes = treehouseSchema.table("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => votingSessions.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }),
  optionId: text("option_id").notNull(), // references option in session.options
  value: text("value"), // 'yes' | 'no' for swipe, 'pick' for bracket round
  round: integer("round"), // for bracket battles
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// CHARACTER DEVELOPMENT SYSTEM (Soul Pivot)
// ============================================

// Stats per member - the 5 character dimensions
// 💪 grit, 🧠 wisdom, ❤️ heart, ⚡ initiative, ⚖️ temperance
export const stats = treehouseSchema.table("stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  statType: text("stat_type").notNull(), // 'grit' | 'wisdom' | 'heart' | 'initiative' | 'temperance'
  currentXp: integer("current_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log - all XP-earning events
export const activityLog = treehouseSchema.table("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  activityType: text("activity_type").notNull(), // 'self_report' | 'check_in' | 'micro_app' | 'bounce_back'
  statAffected: text("stat_affected").notNull(), // which stat got XP
  xpGained: integer("xp_gained").notNull(),
  description: text("description"), // optional description of what was done
  metadata: jsonb("metadata"), // extra data (preset used, micro_app type, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

// Streaks - forgiving streak tracking with bounce-back
export const streaks = treehouseSchema.table("streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull().unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  comebackCount: integer("comeback_count").notNull().default(0),
  lastActiveDate: timestamp("last_active_date"),
  restDaysUsedThisWeek: integer("rest_days_used_this_week").notNull().default(0),
  weekStartDate: timestamp("week_start_date"), // to reset rest days weekly
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily check-ins - builds Wisdom stat
export const checkIns = treehouseSchema.table("check_ins", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  mood: integer("mood").notNull(), // 1-5 (😫 to 🤩)
  proudOf: text("proud_of"), // "One thing I'm proud of today"
  isPrivate: boolean("is_private").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
