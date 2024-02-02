const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/validateTokenHandler");
const { CreateTask, UpdateTask, DeleteTask, getSoftDeletedTasks } = require("../Controllers/taskController");

// Create Task
router.post("/create", validateToken, CreateTask);

// Update Task
router.post("/update", validateToken, UpdateTask);

// Delete Task
router.post("/delete", validateToken, DeleteTask);

// Get Deleted Tasks
router.get('/deletedTasks', validateToken, getSoftDeletedTasks);

module.exports = router;
