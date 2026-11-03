require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./db/connect");

// Import router
const authRouter = require("./routes/auth");
const notesRouter = require("./routes/notes");

// Import middleware
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (keeps Render free tier active & verifies uptime)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "notes-app-api",
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/notes", notesRouter);

// Serve static assets if frontend/dist exists (Docker / full-stack deployment)
const frontendDist = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(.*)$/, (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(frontendDist, "index.html"));
  });
} else {
  // Standalone API mode (e.g. Render backend with separate Vercel frontend)
  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "Notes App API is running",
      health: "/api/health",
    });
  });
}

// Fallback Middleware
app.use(notFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

start();
