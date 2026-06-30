const mongoose = require("mongoose");

const ToDoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "must provide a title"],
    trim: true,
    maxlength: [100, "title cannot be more than 100 characters"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Todo", ToDoSchema);
