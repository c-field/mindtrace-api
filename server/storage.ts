import { users, thoughts, type User, type InsertUser, type Thought, type InsertThought } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Thought operations
  createThought(thought: InsertThought): Promise<Thought>;
  getThoughts(dateFrom?: Date, dateTo?: Date, userId?: number): Promise<Thought[]>;
  deleteAllThoughts(userId?: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createThought(insertThought: InsertThought): Promise<Thought> {
    const [thought] = await db
      .insert(thoughts)
      .values({
        ...insertThought,
        createdAt: new Date(),
      })
      .returning();
    return thought;
  }

  async getThoughts(dateFrom?: Date, dateTo?: Date, userId?: number): Promise<Thought[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(thoughts.userId, userId));
    }
    if (dateFrom) {
      conditions.push(gte(thoughts.createdAt, dateFrom));
    }
    if (dateTo) {
      conditions.push(lte(thoughts.createdAt, dateTo));
    }

    if (conditions.length > 0) {
      return await db.select().from(thoughts).where(and(...conditions)).orderBy(desc(thoughts.createdAt));
    }

    return await db.select().from(thoughts).orderBy(desc(thoughts.createdAt));
  }

  async deleteAllThoughts(userId?: number): Promise<void> {
    if (userId) {
      await db.delete(thoughts).where(eq(thoughts.userId, userId));
    } else {
      await db.delete(thoughts);
    }
  }
}

export const storage = new DatabaseStorage();