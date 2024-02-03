const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectdb = require("./config/dbConnection");
const { validateToken } = require('./middlewares/validateTokenHandler')
const { userRoutes, TaskRoutes, SubTaskRoutes } = require('./routes')
const { DueTaskschedule, ScheduleUpdateTaskPriorities } = require('./CronJobs')


dotenv.config();   // Load environment variables from .env file

// Connection to mongodb
connectdb();

// Initializing port
const port = process.env.PORT || 8800;

// Connecting to express server
app.listen(port, (req, res) => {

    console.log(`server is running on ${port}`)
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/users", userRoutes)
app.use("/api/tasks", validateToken, TaskRoutes)
app.use("/api/subtasks", validateToken, SubTaskRoutes)

// Start cron jobs after database connection
// DueTaskschedule.VoiceCallTasks(); // Call the overdue tasks cron job
// ScheduleUpdateTaskPriorities.ScheduleUpdateTaskPriorities(); // Call the task priority update cron job