const { StatusCodes } = require("http-status-codes");
const { createCustomError } = require("../errors/custom-error");
const asyncWrapper = require("../middleware/async");
const Note = require("../models/Note");

// 1. Get All Notes for Logged-In User
const getNotes = asyncWrapper(async (req, res, next) => {
  const notes = await Note.find({ userId: req.user.userId }).sort("-createdAt");
  res.status(StatusCodes.OK).json({ notes, count: notes.length });
});

// 2. Create Note
const createNote = asyncWrapper(async (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return next(
      createCustomError(
        "Please provide title and content",
        StatusCodes.BAD_REQUEST,
      ),
    );
  }

  // Inject user ID from the verified JWT
  req.body.userId = req.user.userId;

  const note = await Note.create(req.body);
  res.status(StatusCodes.CREATED).json({ note });
});

// 3. Update Note (title, content, tags, color, pin status)
const updateNote = asyncWrapper(async (req, res, next) => {
  const { id: noteId } = req.params;

  // Find note by ID AND ensure it belongs to the logged-in user
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user.userId },
    req.body,
    { new: true, runValidators: true },
  );

  if (!note) {
    return next(
      createCustomError(
        `No note found with id: ${noteId}`,
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  res.status(StatusCodes.OK).json({ note });
});

// 4. Delete Note
const deleteNote = asyncWrapper(async (req, res, next) => {
  const { id: noteId } = req.params;

  // Find note by ID AND ensure it belongs to the logged-in user
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user.userId,
  });

  if (!note) {
    return next(
      createCustomError(
        `No note found with id: ${noteId}`,
        StatusCodes.NOT_FOUND,
      ),
    );
  }

  res.status(StatusCodes.OK).json({ msg: "Note deleted successfully", note });
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
