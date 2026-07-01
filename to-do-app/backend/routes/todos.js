const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.status(200).json({ todos });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ todo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.get("/:id", async (req, res) => {
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

router.patch("/:id", async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const todo = await Todo.findOneAndUpdate({ _id: todoId }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo) {
      return res.status(404).json({ msg: "Todo not found" });
    }
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id: todoId } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: todoId });
    if (!todo) {
      return res.status(404).json({ msg: "Todo not found" });
    }
    res.status(200).json({ todo });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
