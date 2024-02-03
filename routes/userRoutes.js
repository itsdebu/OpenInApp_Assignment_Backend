const express = require("express");
const router = express.Router();
const { UserSignup, UserLogin, getAllTasks, GetAllSubtasks } = require("../Controllers/userController");
const { validateToken } = require("../middlewares/validateTokenHandler");

// User Signup
router.post("/signup", UserSignup);

// User Login
router.post("/login", UserLogin);

module.exports = router;
