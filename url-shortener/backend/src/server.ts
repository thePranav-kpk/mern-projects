import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db"; 
import urlRoutes from "./routes/urlRoutes";
import { redirectUrl } from "./controllers/urlController";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount API Routers
app.use("/api/v1/urls", urlRoutes);
app.get("/r/:shortCode", redirectUrl);

const start = async () => {
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
