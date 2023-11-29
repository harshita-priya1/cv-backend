const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    trim: true,
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // type of data
    required: true,
    ref: "user", // reference to another model
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now() + 5.5 * 60 * 60 * 1000,
  },
});

const Task = mongoose.model("task", taskSchema);

module.exports = Task;
