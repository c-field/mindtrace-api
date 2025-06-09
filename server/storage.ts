import { thoughts, type Thought, type InsertThought, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Thought operations
  createThought(thought: InsertThought): Promise<Thought>;
  getThoughts(dateFrom?: Date, dateTo?: Date): Promise<Thought[]>;
  deleteAllThoughts(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private thoughts: Map<number, Thought>;
  private currentUserId: number;
  private currentThoughtId: number;

  constructor() {
    this.users = new Map();
    this.thoughts = new Map();
    this.currentUserId = 1;
    this.currentThoughtId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createThought(insertThought: InsertThought): Promise<Thought> {
    const id = this.currentThoughtId++;
    const thought: Thought = {
      ...insertThought,
      id,
      createdAt: new Date(),
    };
    this.thoughts.set(id, thought);
    return thought;
  }

  async getThoughts(dateFrom?: Date, dateTo?: Date): Promise<Thought[]> {
    let thoughtsArray = Array.from(this.thoughts.values());
    
    if (dateFrom || dateTo) {
      thoughtsArray = thoughtsArray.filter(thought => {
        const thoughtDate = new Date(thought.createdAt);
        if (dateFrom && thoughtDate < dateFrom) return false;
        if (dateTo && thoughtDate > dateTo) return false;
        return true;
      });
    }
    
    return thoughtsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteAllThoughts(): Promise<void> {
    this.thoughts.clear();
  }
}

export const storage = new MemStorage();
