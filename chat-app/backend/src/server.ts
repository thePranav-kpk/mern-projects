import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allows frontend URL
    credentials: true, // Allow credentials (cookies) to be sent
  }),
);
app.use(express.json());

// Configure Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mySuperSecretCanNotBeDecoded",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
      // Only session id stored in cookie, session is stored in MongoDB
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day, 1000 as it is in milliseconds
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: false, // True if using HTTPS in production
      sameSite: "lax", // Helps protect against CSRF attacks
    },
  }),
);

// Mount Auth Router
app.use("/api/auth", authRoutes);

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
