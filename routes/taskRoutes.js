const express = require("express");
const router = express.Router();
const { CreateTask, UpdateTask, DeleteTask, getSoftDeletedTasks, getAllTasks } = require("../Controllers/taskController");

// Create Task
router.post("/create", CreateTask);

// Update Task
router.post("/update", UpdateTask);

// Delete Task
router.post("/delete", DeleteTask);

// Get Deleted Tasks
router.get('/deletedTasks', getSoftDeletedTasks);

// Get all tasks for a user
router.get("/all", getAllTasks);


module.exports = router;
