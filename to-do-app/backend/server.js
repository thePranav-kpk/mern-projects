require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all HTTP requests
app.use(express.json()); //Parse incoming JSON requests

// Routes
app.get("/", (req, res) => {
  res.send("Todo list backend server is running");
});

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
