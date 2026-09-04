require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db/connect");
const todos = require("./routes/todos");
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all HTTP requests
app.use(express.json()); //Parse incoming JSON requests
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Routes
app.use("/api/v1/todos", todos);
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});
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
