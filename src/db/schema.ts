import { pgTable, text, integer, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

// Family members (kids + parents)
export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  avatar: text("avatar"), // emoji or color
  role: text("role").notNull().default("child"), // 'parent' | 'child'
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Completed activities (for history/leaderboard)
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id),
  type: text("type").notNull(), // 'chore' | 'checklist' | 'dinner_pick'
  name: text("name").notNull(),
  points: integer("points").notNull().default(0),
  metadata: jsonb("metadata"), // flexible data per activity type
  completedAt: timestamp("completed_at").defaultNow(),
});

// Configurable items (chores, checklist items, dinner options)
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // 'chore' | 'checklist_item' | 'dinner_option'
  name: text("name").notNull(),
  points: integer("points").notNull().default(1),
  difficulty: text("difficulty"), // 'easy' | 'medium' | 'hard'
  isDecoy: integer("is_decoy").default(0), // for chore spinner decoys
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
