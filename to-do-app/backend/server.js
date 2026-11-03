require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./db/connect");
const todos = require("./routes/todos");
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all HTTP requests
app.use(express.json()); //Parse incoming JSON requests

// Normalize multiple slashes to prevent 404s when trailing slashes exist in environment variables
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

// Health check endpoint (keeps Render free tier active & verifies uptime)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "to-do-app-api",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/todos", todos);

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
      message: "To-Do App API is running",
      health: "/api/health",
    });
  });
}

app.use(notFound); // Handle 404 errors for undefined routes
app.use(errorHandlerMiddleware); // Handle errors

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully...");
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log("Database connection failed: ", error.message);
  }
};

start();
