const express = require("express");
const router = express.Router();

const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notes");

const authMiddleware = require("../middleware/auth");

// Protect all routes with this middleware
router.use(authMiddleware);

router.route("/").get(getNotes).post(createNote);
router.route("/:id").patch(updateNote).delete(deleteNote);

module.exports = router;
