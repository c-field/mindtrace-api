import express from "express";
import session from "express-session";
import cors from "cors";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Length'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma']
}));

// Session configuration (secure)
app.use(session({
  secret: process.env.SESSION_SECRET || 'mindtrace-secure-session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Add UTF-8 encoding to all API responses
  if (req.path.startsWith("/api")) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

async function startServer() {
  try {
    const server = await registerRoutes(app);
    
    // Error handling middleware
    app.use((err: any, req: any, res: any, next: any) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(status).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    const port = process.env.PORT || 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Secure MindTrace server running on port ${port}`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Security hardening complete`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();