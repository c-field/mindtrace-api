import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThoughtSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Email address already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Set session
      (req.session as any).userId = user.id;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      (req.session as any).userId = user.id;
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid login data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({ id: user.id, username: user.username });
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Middleware to check authentication for protected routes
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.userId = userId;
    next();
  };

  // Get all thoughts with optional date filtering
  app.get("/api/thoughts", requireAuth, async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      let from: Date | undefined;
      let to: Date | undefined;
      
      if (dateFrom && typeof dateFrom === 'string') {
        from = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        to = new Date(dateTo);
        // Set end of day for 'to' date
        to.setHours(23, 59, 59, 999);
      }
      
      const thoughts = await storage.getThoughts(from, to);
      res.json(thoughts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve thoughts" });
    }
  });

  // Create a new thought
  app.post("/api/thoughts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertThoughtSchema.parse(req.body);
      const thought = await storage.createThought(validatedData);
      res.status(201).json(thought);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid thought data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create thought" });
      }
    }
  });

  // Delete all thoughts
  app.delete("/api/thoughts", requireAuth, async (req, res) => {
    try {
      await storage.deleteAllThoughts();
      res.json({ message: "All thoughts deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete thoughts" });
    }
  });

  // Export thoughts as CSV
  app.get("/api/export/csv", requireAuth, async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      let from: Date | undefined;
      let to: Date | undefined;
      
      if (dateFrom && typeof dateFrom === 'string') {
        from = new Date(dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
      }
      
      const thoughts = await storage.getThoughts(from, to);
      
      // Create CSV content
      const csvHeader = "Date,Category,Intensity,Trigger,Content\n";
      const csvRows = thoughts.map(thought => {
        const date = new Date(thought.createdAt).toLocaleDateString();
        const content = `"${thought.content.replace(/"/g, '""')}"`;
        const trigger = thought.trigger ? `"${thought.trigger.replace(/"/g, '""')}"` : "";
        const category = `"${thought.category}"`;
        return `${date},${category},${thought.intensity},${trigger},${content}`;
      }).join("\n");
      
      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mindtrace-thoughts.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export thoughts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
