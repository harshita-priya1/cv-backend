const express = require("express");

const Task = require("../models/task.model");

async function getAllTasks(req, res) {
  try {
    const { user } = req.query; // user id is sent with query
    let response = await Task.find({ user: user });
    if (response) {
      res.status(200).json({ data: response, message: "All tasks found" });
    } else {
      res.status(404).json({ message: "No tasks found!" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "Error getting all tasks" });
  }
}

async function createTask(req, res) {
  try {
    let { title, description, completed, endDate, user } = req.body; // user id is sent with body
    let task = new Task({
      title: title,
      description: description,
      completed: completed,
      user: user,
    });
    if (endDate) {
      task = new Task({
        title: title,
        description: description,
        completed: completed,
        user: user,
        endDate: endDate,
      });
    }
    const savedTask = await task.save();
    if (savedTask) {
      res.status(201).json({ data: savedTask, message: "Task created" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "Error creating task" });
  }
}

async function getTask(req, res) {
  try {
    let { id } = req.params.id;
    const task = await Task.findById(id);
    if (task) {
      res.status(200).json({ data: task, message: "Task found" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "Error getting task" });
  }
}

async function updateTask(req, res) {
  try {
    let { id } = req.params.id;
    let { title, description, completed, endDate } = req.body;
    let task = await Task.findById(id);
    if (task) {
      task.title = title;
      task.description = description;
      task.completed = completed;
      if (endDate) {
        task.endDate = endDate;
      }
      const updatedTask = await task.save();
      if (updatedTask) {
        res.status(200).json({ data: updatedTask, message: "Task updated" });
      } else {
        res.status(500).json({ message: "Error updating task" });
      }
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "Error updating task" });
  }
}

async function deleteTask(req, res) {
  try {
    let { id } = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (deletedTask) {
      res.status(200).json({ data: deletedTask, message: "Task deleted" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: "Error deleting task" });
  }
}

module.exports = {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
