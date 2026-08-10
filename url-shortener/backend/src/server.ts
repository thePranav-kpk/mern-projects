import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import urlRoutes from "./routes/urlRoutes";
import { redirectUrl } from "./controllers/urlController";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from React build folder
app.use(express.static(path.resolve(__dirname, "../../frontend/dist")));

// Mount API Routers
app.use("/api/v1/urls", urlRoutes);
app.get("/r/:shortCode", redirectUrl);

// Catch-all route for Single Page Application
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../frontend/dist", "index.html"));
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
