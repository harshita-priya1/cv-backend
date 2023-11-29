const express = require("express");

const taskRouter = express.Router();

taskRouter.get("/", getAllTasks);
taskRouter.post("/", createTask);
taskRouter.get("/:id", getTask);
taskRouter.put("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);

module.exports = taskRouter;
