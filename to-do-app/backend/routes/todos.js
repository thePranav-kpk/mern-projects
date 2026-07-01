const express = require("express");
const router = express.Router();
const {
  getAllTodos,
  createTodo,
  getTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todos");

// router.get("/", getAllTodos);
// router.post("/", createTodo);
// router.get("/:id", getTodo);
// router.patch("/:id", updateTodo);
// router.delete("/:id", deleteTodo);

router.route("/").get(getAllTodos).post(createTodo);
router.route("/:id").get(getTodo).patch(updateTodo).delete(deleteTodo);

module.exports = router;
