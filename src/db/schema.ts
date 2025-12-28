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
