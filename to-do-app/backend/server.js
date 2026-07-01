require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connect");
const Todo = require("./models/Todo");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all HTTP requests
app.use(express.json()); //Parse incoming JSON requests

// Routes
app.get("/", (req, res) => {
  res.send("Todo list backend server is running");
});

app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.status(200).json({ todos });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.post("/api/v1/todos", async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ todo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

app.get("/api/v1/todos/:id", async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const todo = await Todo.findOne({ _id: todoId });
    if (!todo) {
      return res.status(404).json({ msg: "Todo not found" });
    }
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
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
