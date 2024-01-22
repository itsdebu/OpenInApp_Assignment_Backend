const express = require("express");
const router = express.Router();
const { UserSignup, UserLogin, getAllTasks, GetAllSubtasks } = require("../Controllers/userController");
const { validateToken } = require("../middlewares/validateTokenHandler");

// User Signup
router.post("/signup", UserSignup);

// User Login
router.post("/login", UserLogin);

// Get all tasks for a user
router.get("/tasks", validateToken, getAllTasks);

// Get all subtasks for a task
router.get("/subtasks", validateToken, GetAllSubtasks);

module.exports = router;
