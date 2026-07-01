const Todo = require("../models/Todo");
const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-error");

const getAllTodos = asyncWrapper(async (req, res) => {
  const todos = await Todo.find({});
  res.status(200).json({ todos });
});

const createTodo = asyncWrapper(async (req, res) => {
  const todo = await Todo.create(req.body);
  res.status(201).json({ todo });
});

const getTodo = asyncWrapper(async (req, res) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOne({ _id: todoId });
  if (!todo) {
    return next(createCustomError(`No todo with id: ${todoId}`, 404));
  }
  res.status(200).json({ todo });
});

const updateTodo = asyncWrapper(async (req, res) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOneAndUpdate({ _id: todoId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!todo) {
    return next(createCustomError(`No todo with id: ${todoId}`, 404));
  }
  res.status(200).json({ todo });
});

const deleteTodo = asyncWrapper(async (req, res) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOneAndDelete({ _id: todoId });
  if (!todo) {
    return next(createCustomError(`No todo with id: ${todoId}`, 404));
  }
  res.status(200).json({ todo });
});

module.exports = {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
};
