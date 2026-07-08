require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
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

// Serve static assets from React build folder
app.use(express.static(path.resolve(__dirname, "../frontend/dist")));

// Mount routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/notes", notesRouter);

// Redirect all other GET requests to React's index.html
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

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
