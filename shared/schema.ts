import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull(),
  cognitiveDistortions: text("cognitive_distortions").array().notNull(),
  trigger: text("trigger"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThoughtSchema = createInsertSchema(thoughts).omit({
  id: true,
  createdAt: true,
});

export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type Thought = typeof thoughts.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  username: z.string().email("Username must be a valid email address"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;