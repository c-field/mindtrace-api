import { users, thoughts, type User, type InsertUser, type Thought, type InsertThought } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Thought operations
  createThought(thought: InsertThought): Promise<Thought>;
  getThoughts(dateFrom?: Date, dateTo?: Date): Promise<Thought[]>;
  deleteAllThoughts(): Promise<void>;
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

  async getThoughts(dateFrom?: Date, dateTo?: Date): Promise<Thought[]> {
    let query = db.select().from(thoughts);
    
    if (dateFrom || dateTo) {
      const conditions = [];
      if (dateFrom) {
        conditions.push(gte(thoughts.createdAt, dateFrom));
      }
      if (dateTo) {
        conditions.push(lte(thoughts.createdAt, dateTo));
      }
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(thoughts.createdAt));
  }

  async deleteAllThoughts(): Promise<void> {
    await db.delete(thoughts);
  }
}

export const storage = new DatabaseStorage();