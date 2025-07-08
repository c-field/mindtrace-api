import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThoughtSchema, insertUserSchema, updateUserSchema, users, thoughts } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import supabase from "./lib/supabase";

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

  // Handle OPTIONS preflight for login
  app.options("/api/auth/login", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "capacitor://localhost");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
  });

  app.post("/api/auth/login", async (req, res) => {
    // Set CORS headers for Capacitor iOS app
    res.setHeader("Access-Control-Allow-Origin", "capacitor://localhost");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    try {
      const { username, password } = req.body;
      
      console.log("=== DEBUG: Login attempt ===");
      console.log("Username:", username);
      console.log("Password length:", password?.length);
      
      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      });
      
      console.log("Supabase auth response:", { authData, authError });
      
      if (authError || !authData.user) {
        console.error("Supabase auth error:", authError);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Query the users table to get the user record with the UUID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .single();
      
      console.log("Supabase users query result:", userData);
      console.log("Supabase users query error:", userError);
      
      if (userError || !userData) {
        console.error("Failed to fetch user from users table:", userError);
        return res.status(401).json({ message: "User not found in database" });
      }
      
      // Store both numeric ID and Supabase UUID in session
      (req.session as any).userId = 1; // Keep for backward compatibility  
      (req.session as any).supabaseUserId = userData.id; // Store real Supabase UUID from users table
      
      console.log("✅ Supabase authentication successful");
      console.log("Real User UUID from users table:", userData.id);
      console.log("Username:", userData.username);
      console.log("Session after setting supabaseUserId:", req.session);
      
      res.json({ id: userData.id, username: userData.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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
    
    res.json({ id: user.id, username: user.username, name: user.name });
  });

  app.patch("/api/auth/profile", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      res.json({ id: updatedUser.id, username: updatedUser.username, name: updatedUser.name });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Database API endpoints for HubSpot integration
  app.get("/api/database/users", async (req, res) => {
    try {
      // Get all users with basic info (no passwords)
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        created_at: users.created_at
      }).from(users);
      
      res.json(allUsers);
    } catch (error) {
      console.error("Database users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/database/users/:userId/thoughts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get all thoughts for a specific user
      const userThoughts = await db.select().from(thoughts).where(eq(thoughts.userId, userId));
      
      res.json(userThoughts);
    } catch (error) {
      console.error("Database user thoughts error:", error);
      res.status(500).json({ message: "Failed to fetch user thoughts" });
    }
  });

  app.get("/api/database/analytics", async (req, res) => {
    try {
      // Get analytics data for HubSpot integration
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const totalThoughts = await db.select({ count: sql`count(*)` }).from(thoughts);
      
      // Get user engagement stats
      const activeUsers = await db.select({
        userId: thoughts.userId,
        thoughtCount: sql`count(*)`
      })
      .from(thoughts)
      .groupBy(thoughts.userId);

      res.json({
        totalUsers: totalUsers[0].count,
        totalThoughts: totalThoughts[0].count,
        activeUsers: activeUsers.length,
        userEngagement: activeUsers
      });
    } catch (error) {
      console.error("Database analytics error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Middleware to check authentication for protected routes
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      console.log("=== DEBUG: requireAuth middleware ===");
      console.log("Session:", req.session);
      console.log("User ID from session:", req.session?.userId);
      console.log("Supabase User ID from session:", req.session?.supabaseUserId);
      
      const userId = req.session?.userId;
      const supabaseUserId = req.session?.supabaseUserId;
      
      if (!userId && !supabaseUserId) {
        console.log("=== DEBUG: Authentication failed - no user ID ===");
        // Ensure we always return JSON for auth failures and NEVER fall through
        res.setHeader('Content-Type', 'application/json');
        return res.status(401).json({ 
          success: false,
          message: "Authentication required",
          error: "No valid session found"
        });
      }
      
      console.log("=== DEBUG: Authentication successful ===");
      req.userId = userId;
      req.supabaseUserId = supabaseUserId;
      next();
    } catch (error) {
      console.error("=== DEBUG: requireAuth middleware error ===", error);
      // Even middleware errors should return JSON
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error instanceof Error ? error.message : "Unknown auth error"
      });
    }
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
      
      const userId = (req.session as any).userId;
      const thoughts = await storage.getThoughts(from, to, userId);
      res.json(thoughts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve thoughts" });
    }
  });

  // Debug route to test if API routing is working
  app.all("/api/test", (req, res) => {
    console.log("=== DEBUG: Test route hit ===");
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: "API routing is working", method: req.method });
  });

  // Debug route to return authenticated user info
  app.get("/api/me", requireAuth, async (req, res) => {
    console.log("🔐 Authenticated user ID:", req.session?.userId);
    console.log("🔐 Full session:", req.session);
    res.status(200).json({ 
      userId: req.session?.userId,
      authenticated: true,
      session: req.session 
    });
  });

  // Create a new thought
  console.log("🔧 Registering POST /api/thoughts route...");
  app.post("/api/thoughts", requireAuth, async (req, res) => {
    try {
      const { content, cognitiveDistortion, intensity } = req.body;
      const supabaseUserId = req.session?.supabaseUserId;

      console.log("=== DEBUG: POST /api/thoughts ===");
      console.log("Request body:", req.body);
      console.log("Supabase User ID:", supabaseUserId);

      if (!content || !cognitiveDistortion || typeof intensity !== "number") {
        return res.status(400).json({ success: false, error: "Missing or invalid fields" });
      }

      if (!supabaseUserId) {
        return res.status(401).json({ success: false, error: "Supabase user ID not found in session" });
      }

      // Map camelCase to snake_case for Supabase
      console.log("Attempting to insert thought with UUID:", supabaseUserId);
      
      const { data, error } = await supabase.from("thoughts").insert([
        {
          user_id: supabaseUserId,
          content: content,
          cognitive_distortion: cognitiveDistortion,
          intensity: intensity,
          created_at: new Date().toISOString()
        }
      ]).select();

      console.log("Supabase insert response:", { data, error });

      if (error) {
        console.error("Supabase insert error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        // Check if it's an RLS policy violation
        if (error.code === '42501') {
          console.error("RLS Policy violation - the user_id may not exist in the users table");
          console.error("Trying to insert with user_id:", supabaseUserId);
          
          // Verify the user exists in the users table
          const { data: userCheck, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', supabaseUserId)
            .single();
            
          console.log("User existence check:", { userCheck, userCheckError });
        }
        
        return res.status(500).json({ success: false, error: error.message || "Database insert failed" });
      }

      console.log("✅ Thought inserted successfully:", data);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("=== DEBUG: POST /api/thoughts ERROR ===");
      console.error("Error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Delete all thoughts
  app.delete("/api/thoughts", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await storage.deleteAllThoughts(userId);
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
      
      const userId = (req.session as any).userId;
      const thoughts = await storage.getThoughts(from, to, userId);
      
      // Create CSV content
      const csvHeader = "Date,Intensity,Cognitive Distortion,Trigger,Content\n";
      const csvRows = thoughts.map(thought => {
        const date = new Date(thought.created_at).toLocaleDateString();
        const content = `"${thought.content.replace(/"/g, '""')}"`;
        const trigger = thought.trigger ? `"${thought.trigger.replace(/"/g, '""')}"` : "";
        const distortion = `"${thought.cognitiveDistortion}"`;
        return `${date},${thought.intensity},${distortion},${trigger},${content}`;
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
