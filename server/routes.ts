import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertThoughtSchema } from "../shared/schema.js";
import { z } from "zod";
import supabase from "./lib/supabase.js";
import { asyncHandler, createAppError } from "./middleware/errorHandler.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to check authentication for protected routes
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const supabaseUserId = req.session?.supabaseUserId;
      
      if (!supabaseUserId) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(401).json({ 
          success: false,
          message: "Authentication required",
          error: "No valid session found"
        });
      }
      
      req.supabaseUserId = supabaseUserId;
      next();
    } catch (error) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error instanceof Error ? error.message : "Unknown auth error"
      });
    }
  };

  // Authentication routes - Supabase only (secure)
  app.post("/api/auth/signup", authLimiter, asyncHandler(async (req, res) => {
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
      throw createAppError("Registration failed", 500);
    }
  }));

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

  app.post("/api/auth/logout", async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false,
          message: "Failed to logout" 
        });
      }
      res.json({ 
        success: true,
        message: "Logged out successfully" 
      });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const supabaseUserId = (req.session as any)?.supabaseUserId;
    const userEmail = (req.session as any)?.userEmail;
    
    if (!supabaseUserId) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }
    
    // Get user data from Supabase only
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, username, name')
      .eq('id', supabaseUserId)
      .single();
    
    if (error || !userData) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true,
      user: {
        id: userData.id, 
        email: userEmail,
        name: userData.name 
      }
    });
  });

  // Secure thought management routes
  app.post("/api/thoughts", requireAuth, async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const thoughtData = insertThoughtSchema.parse(req.body);
      
      // Use Supabase service role for secure database operations
      const { data: thought, error } = await supabase
        .from('thoughts')
        .insert({
          user_id: req.supabaseUserId,
          content: thoughtData.content,
          intensity: thoughtData.intensity,
          cognitive_distortion: thoughtData.cognitiveDistortion,
          trigger: thoughtData.trigger,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to save thought",
          error: error.message
        });
      }

      res.status(201).json({
        success: true,
        data: thought
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid thought data",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to create thought"
        });
      }
    }
  });

  app.get("/api/thoughts", requireAuth, async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { dateFrom, dateTo } = req.query;
      
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', req.supabaseUserId)
        .order('created_at', { ascending: false });

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data: thoughts, error } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch thoughts"
        });
      }

      res.json({
        success: true,
        data: thoughts || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve thoughts"
      });
    }
  });

  app.get("/api/export", requireAuth, async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { dateFrom, dateTo } = req.query;
      
      let query = supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', req.supabaseUserId)
        .order('created_at', { ascending: false });

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data: thoughts, error } = await query;

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to export thoughts"
        });
      }

      // Generate CSV data
      const csvHeader = 'Date,Content,Intensity,Cognitive Pattern,Trigger\n';
      const csvRows = (thoughts || []).map(thought => {
        const date = new Date(thought.created_at).toLocaleDateString();
        const content = `"${thought.content.replace(/"/g, '""')}"`;
        const intensity = thought.intensity;
        const cognitiveDistortion = `"${thought.cognitive_distortion || ''}"`;
        const trigger = `"${thought.trigger || ''}"`;
        return `${date},${content},${intensity},${cognitiveDistortion},${trigger}`;
      }).join('\n');

      const csvData = csvHeader + csvRows;

      res.json({
        success: true,
        data: csvData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to export data"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ 
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString()
    });
  });

  const server = createServer(app);
  return server;
}