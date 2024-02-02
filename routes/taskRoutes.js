const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/validateTokenHandler");
const { CreateTask, UpdateTask, DeleteTask, getSoftDeletedTasks } = require("../Controllers/taskController");

// Create Task
router.post("/create", validateToken, CreateTask);

// Update Task
router.put("/update/:task_id", validateToken, UpdateTask);

// Delete Task
router.delete("/delete/:task_id", validateToken, DeleteTask);

// Get Deleted Tasks
router.get('/deletedTasks', validateToken, getSoftDeletedTasks);

module.exports = router;
