import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertThoughtSchema, insertUserSchema, updateUserSchema, users, thoughts } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
        createdAt: users.createdAt
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
      
      const userId = req.session?.userId;
      if (!userId) {
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

  // Create a new thought
  console.log("🔧 Registering POST /api/thoughts route...");
  app.post("/api/thoughts", requireAuth, async (req, res) => {
    // FIRST: Log that we actually hit this route
    console.log("🎯 POST /api/thoughts ROUTE HIT - This should NEVER serve HTML!");
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    console.log("Request path:", req.path);
    
    // Ensure we ALWAYS return JSON and never fall through to static handler
    res.setHeader('Content-Type', 'application/json');
    console.log("✅ Content-Type set to application/json");
    
    try {
      const userId = (req.session as any).userId;
      
      // Debug logging for iOS
      console.log("=== DEBUG: POST /api/thoughts ===");
      console.log("Request body:", req.body);
      console.log("Request body type:", typeof req.body);
      console.log("User ID:", userId);
      console.log("Content-Type:", req.headers['content-type']);
      
      // Early validation with warning log
      if (!req.body || typeof req.body !== 'object') {
        console.warn("⚠️  Invalid request body received:", req.body);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid request body",
          error: "Request body must be a valid object"
        });
      }
      
      // Validate required fields
      const { content, cognitiveDistortion, intensity, trigger } = req.body;
      
      if (!content || typeof content !== 'string') {
        console.warn("⚠️  Missing or invalid content:", content);
        return res.status(400).json({
          success: false,
          message: "Content is required and must be a string",
          error: `Received content: ${typeof content}`
        });
      }
      
      if (!cognitiveDistortion || typeof cognitiveDistortion !== 'string') {
        console.warn("⚠️  Missing or invalid cognitiveDistortion:", cognitiveDistortion);
        return res.status(400).json({
          success: false,
          message: "Cognitive distortion is required and must be a string",
          error: `Received cognitiveDistortion: ${typeof cognitiveDistortion}`
        });
      }
      
      if (intensity === undefined || typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
        console.warn("⚠️  Invalid intensity:", intensity);
        return res.status(400).json({
          success: false,
          message: "Intensity must be a number between 1 and 10",
          error: `Received intensity: ${intensity} (${typeof intensity})`
        });
      }
      
      // Log individual properties and their types
      console.log("Body properties:", {
        content: { value: content, type: typeof content },
        cognitiveDistortion: { value: cognitiveDistortion, type: typeof cognitiveDistortion },
        trigger: { value: trigger, type: typeof trigger },
        intensity: { value: intensity, type: typeof intensity }
      });
      
      const dataToValidate = {
        content,
        cognitiveDistortion,
        intensity,
        trigger: trigger || undefined,
        userId
      };
      
      console.log("Data to validate:", dataToValidate);
      
      const validatedData = insertThoughtSchema.parse(dataToValidate);
      console.log("Validated data:", validatedData);
      
      const thought = await storage.createThought(validatedData);
      console.log("Created thought:", thought);
      
      // ALWAYS return JSON - never let this fall through
      console.log("✅ About to send SUCCESS response");
      console.log("Current Content-Type before response:", res.get('Content-Type'));
      const response = {
        success: true,
        thought,
        message: "Thought created successfully"
      };
      console.log("Response object:", response);
      return res.status(201).json(response);
      
    } catch (error) {
      console.error("=== DEBUG: POST /api/thoughts ERROR ===");
      console.error("Error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      // ALWAYS return JSON even for unexpected errors
      console.log("❌ About to send ERROR response");
      console.log("Current Content-Type before error response:", res.get('Content-Type'));
      
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        const errorResponse = { 
          success: false,
          message: "Invalid thought data", 
          errors: error.errors,
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
        console.log("Zod error response object:", errorResponse);
        return res.status(400).json(errorResponse);
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Other error:", errorMessage);
        const errorResponse = { 
          success: false,
          message: "Failed to create thought",
          error: errorMessage
        };
        console.log("General error response object:", errorResponse);
        return res.status(500).json(errorResponse);
      }
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
        const date = new Date(thought.createdAt).toLocaleDateString();
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
