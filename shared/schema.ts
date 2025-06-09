import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const thoughts = pgTable("thoughts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  trigger: text("trigger"),
  intensity: integer("intensity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThoughtSchema = createInsertSchema(thoughts).omit({
  id: true,
  createdAt: true,
});

export type InsertThought = z.infer<typeof insertThoughtSchema>;
export type Thought = typeof thoughts.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
