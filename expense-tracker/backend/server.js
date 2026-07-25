require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");

// Import routers
const authRouter = require("./routes/auth");
const transactionsRouter = require("./routes/transactions");

// Import middleware
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount Auth Router
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/transactions", transactionsRouter);

// Fallback middlewares
app.use(notFound);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully...");
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();
