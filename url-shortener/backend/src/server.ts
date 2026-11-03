import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./config/db";
import urlRoutes from "./routes/urlRoutes";
import { redirectUrl } from "./controllers/urlController";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Normalize multiple slashes to prevent 404s when trailing slashes exist in environment variables
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

// Health check endpoint (keeps Render free tier active & verifies uptime)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "url-shortener-api",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routers
app.use("/api/v1/urls", urlRoutes);
app.get("/r/:shortCode", redirectUrl);

// Serve static assets if frontend/dist exists (Docker / full-stack deployment)
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(.*)$/, (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/r/")) return next();
    res.sendFile(path.resolve(frontendDist, "index.html"));
  });
} else {
  // Standalone API mode (e.g. Render backend with separate Vercel frontend)
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "TrimURL API is running",
      health: "/api/health",
    });
  });
}

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ msg: "Route does not exist" });
});

const start = async (): Promise<void> => {
  try {
    await connectDB(process.env.MONGO_URI || "");
    console.log("Connected to MongoDB successfully...");
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();
