import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertThoughtSchema } from "@shared/schema";
import { z } from "zod";
import supabase from "./lib/supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes - Supabase only
  app.post("/api/auth/signup", async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Email and password are required" 
        });
      }

      // Create user with Supabase Auth (handles password hashing securely)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return res.status(400).json({ 
          success: false,
          message: authError.message 
        });
      }

      if (!authData.user) {
        return res.status(400).json({ 
          success: false,
          message: "Failed to create user account" 
        });
      }

      // Create user record in database with Supabase user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: email,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        return res.status(500).json({ 
          success: false,
          message: "Failed to create user profile" 
        });
      }

      // Store Supabase user ID in session (no local user data storage)
      (req.session as any).supabaseUserId = authData.user.id;
      (req.session as any).userEmail = email;
      
      res.status(201).json({ 
        success: true,
        user: { 
          id: authData.user.id, 
          email: email 
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Registration failed" 
      });
    }
  });

  // Handle OPTIONS preflight for login - simplified for development
  app.options("/api/auth/login", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
  });

  app.post("/api/auth/login", async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Email and password are required" 
        });
      }
      
      // Authenticate with Supabase Auth (secure password verification)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError || !authData.user) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
      
      // Verify user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', authData.user.id)
        .single();
      
      if (userError || !userData) {
        return res.status(401).json({ 
          success: false,
          message: "User profile not found" 
        });
      }
      
      // Store only Supabase user ID in session (no local user data)
      (req.session as any).supabaseUserId = authData.user.id;
      (req.session as any).userEmail = email;
      
      res.json({ 
        success: true,
        message: "Login successful",
        user: { 
          id: authData.user.id, 
          email: email 
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Authentication failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
      
      // Ensure response is properly formatted JSON with UTF-8 encoding
      const response = { 
        id: userData.id, 
        username: userData.username 
      };
      
      if (isProduction) {
        console.log('Login successful, sending response:', JSON.stringify(response).substring(0, 100));
      }
      
      // Force JSON response with explicit encoding and prevent caching
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Ensure we don't return before the response is sent
      return res.status(200).json(response);
    } catch (error) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        console.log('Login endpoint error:', error.message);
      }
      
      // Ensure error response is properly formatted
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
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
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
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
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Database API endpoints for HubSpot integration
  app.get("/api/database/users", async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      // Get all users with basic info (no passwords)
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        created_at: users.created_at
      }).from(users);
      
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/database/users/:userId/thoughts", async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get all thoughts for a specific user
      const userThoughts = await db.select().from(thoughts).where(eq(thoughts.userId, userId));
      
      res.json(userThoughts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user thoughts" });
    }
  });

  app.get("/api/database/analytics", async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
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
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Middleware to check authentication for protected routes
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const userId = req.session?.userId;
      const supabaseUserId = req.session?.supabaseUserId;
      
      if (!userId && !supabaseUserId) {
        // Ensure we always return JSON for auth failures and NEVER fall through
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(401).json({ 
          success: false,
          message: "Authentication required",
          error: "No valid session found"
        });
      }
      
      req.userId = userId;
      req.supabaseUserId = supabaseUserId;
      next();
    } catch (error) {
      // Even middleware errors should return JSON
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error instanceof Error ? error.message : "Unknown auth error"
      });
    }
  };

  // Get all thoughts with optional date filtering
  app.get("/api/thoughts", requireAuth, async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { dateFrom, dateTo } = req.query;
      const supabaseUserId = req.session?.supabaseUserId;
      
      if (!supabaseUserId) {
        return res.status(401).json({ message: "Supabase user ID not found in session" });
      }
      
      let query = supabase.from("thoughts").select("*").eq("user_id", supabaseUserId);
      
      if (dateFrom && typeof dateFrom === 'string') {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo && typeof dateTo === 'string') {
        query = query.lte("created_at", dateTo);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        return res.status(500).json({ message: "Failed to retrieve thoughts from database" });
      }
      
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve thoughts" });
    }
  });

  // Debug route to test if API routing is working
  app.all("/api/test", (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ message: "API routing is working", method: req.method });
  });

  // Debug route to return authenticated user info
  app.get("/api/me", requireAuth, async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ 
      userId: req.session?.userId,
      authenticated: true,
      session: req.session 
    });
  });

  // Create a new thought
  app.post("/api/thoughts", requireAuth, async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { content, cognitiveDistortion, intensity } = req.body;
      const supabaseUserId = req.session?.supabaseUserId;

      if (!content || !cognitiveDistortion || typeof intensity !== "number") {
        return res.status(400).json({ success: false, error: "Missing or invalid fields" });
      }

      if (!supabaseUserId) {
        return res.status(401).json({ success: false, error: "Supabase user ID not found in session" });
      }

      // Map camelCase to snake_case for Supabase
      const { data, error } = await supabase.from("thoughts").insert([
        {
          user_id: supabaseUserId,
          content: content,
          cognitive_distortion: cognitiveDistortion,
          intensity: intensity,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (error) {
        // Check if it's an RLS policy violation
        if (error.code === '42501') {
          // Verify the user exists in the users table
          const { data: userCheck, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', supabaseUserId)
            .single();
            
          if (userCheckError || !userCheck) {
            return res.status(401).json({ success: false, error: "User not found in database" });
          }
        }
        
        return res.status(500).json({ success: false, error: error.message || "Database insert failed" });
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Delete all thoughts
  app.delete("/api/thoughts", requireAuth, async (req, res) => {
    // Ensure UTF-8 encoding for all responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
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
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="mindtrace-thoughts.csv"');
      res.send(csv);
    } catch (error) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(500).json({ message: "Failed to export thoughts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
