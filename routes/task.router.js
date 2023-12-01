const express = require("express");

const validateToken = require("../middlewares/validateToken.middleware");
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const taskRouter = express.Router();

taskRouter.use(validateToken);

taskRouter.get("/", getAllTasks); //deals with query
taskRouter.post("/", createTask); // deals with body
taskRouter.get("/:id", getTask); //deals with params
taskRouter.put("/:id", updateTask); //deals with params and body
taskRouter.delete("/:id", deleteTask); //deals with params

module.exports = taskRouter;
