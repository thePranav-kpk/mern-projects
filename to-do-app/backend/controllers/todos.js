const Todo = require("../models/Todo");
const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

const getAllTodos = asyncWrapper(async (req, res) => {
  const todos = await Todo.find({});
  res.status(StatusCodes.OK).json({ todos });
});

const createTodo = asyncWrapper(async (req, res) => {
  const todo = await Todo.create(req.body);
  res.status(StatusCodes.CREATED).json({ todo });
});

const getTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOne({ _id: todoId });
  if (!todo) {
    return next(
      createCustomError(`No todo with id : ${todoId}`, StatusCodes.NOT_FOUND),
    );
  }
  res.status(StatusCodes.OK).json({ todo });
});

const updateTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOneAndUpdate({ _id: todoId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!todo) {
    return next(
      createCustomError(`No todo with id : ${todoId}`, StatusCodes.NOT_FOUND),
    );
  }
  res.status(StatusCodes.OK).json({ todo });
});

const deleteTodo = asyncWrapper(async (req, res, next) => {
  const { id: todoId } = req.params;
  const todo = await Todo.findOneAndDelete({ _id: todoId });
  if (!todo) {
    return next(
      createCustomError(`No todo with id : ${todoId}`, StatusCodes.NOT_FOUND),
    );
  }
  res.status(StatusCodes.OK).json({ todo });
});

module.exports = {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
};
