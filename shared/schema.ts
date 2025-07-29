import { z } from "zod";

// Simplified schema - no local user storage, Supabase handles auth
export const insertThoughtSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content too long"),
  intensity: z.number().min(1).max(10),
  cognitiveDistortion: z.string().min(1, "Cognitive distortion is required"),
  trigger: z.string().optional(),
});

export type InsertThought = z.infer<typeof insertThoughtSchema>;

// User types for Supabase integration
export interface User {
  id: string; // Supabase UUID
  username: string;
  name?: string;
  created_at: string;
}

export interface Thought {
  id: string;
  user_id: string;
  content: string;
  intensity: number;
  cognitive_distortion: string;
  trigger?: string;
  created_at: string;
}