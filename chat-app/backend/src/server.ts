import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";

import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import messageRoutes from "./routes/message";
import { wrapSession, socketAuth } from "./middleware/socketAuth";
import { registerChatHandlers } from "./sockets/chatHandler";

// 1. Initialize Express App & HTTP Server
const app = express();
app.set("trust proxy", 1); // Trust first proxy for secure cookies behind reverse proxy

// Use HTTP Server, as app = express() is not a network server but just an Express request handler function
const httpServer = http.createServer(app);
const port = process.env.PORT || 5000;

// 2. Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allows frontend URL to access cookies
    credentials: true, // Allow credentials (cookies) to be sent
  }),
);
app.use(express.json());

// 3. Configure Express Session Middleware
// session is a function taking options object as arg & returns Express middleware function (req, res, next)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "mySuperSecretCanNotBeDecoded",
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  store: MongoStore.create({
    // Only session id stored in cookie, session is stored in MongoDB
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day, multiply 1000 as it is in milliseconds
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: true, // True if using HTTPS in production
    sameSite: "none",
  },
});
app.use(sessionMiddleware); // Attaches session processing to Express HTTP requests

// 4. Configure Socket.io Server & Handshake Guards
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.use(wrapSession(sessionMiddleware));
io.use(socketAuth);
registerChatHandlers(io);

// 5. Mount Auth Router
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// 6. Start HTTP Server & WebSocket Server
const start = async (): Promise<void> => {
  try {
    await connectDB(process.env.MONGO_URI || "");
    console.log("Connected to MongoDB successfully...");

    // Both HTTP and WebSocket start on same port
    httpServer.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();
