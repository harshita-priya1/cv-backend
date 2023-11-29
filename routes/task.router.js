const express = require("express");

const taskRouter = express.Router();

taskRouter.get("/", getAllTasks); //deals with query
taskRouter.post("/", createTask); // deals with body
taskRouter.get("/:id", getTask); //deals with params
taskRouter.put("/:id", updateTask); //deals with params and body
taskRouter.delete("/:id", deleteTask); //deals with params

module.exports = taskRouter;
