const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectdb = require("./config/dbConnection");
const userRoutes = require("./routes/userRoutes")
const TaskRoutes = require("./routes/taskRoutes")
const SubTaskRoutes = require("./routes/SubtaskRoutes")
const DueTaskschedule = require("./CronJobs/TwilioPhoneCron")
const ScheduleUpdateTaskPriorities = require("./CronJobs/TaskPriorityCron")


dotenv.config();   // Load environment variables from .env file

// Connection to mongodb
connectdb();

// Initializing port
const port = process.env.PORT || 8800;

// Connecting to express server
app.listen(port, (req, res) => {

    console.log(`server is running on ${port}`)
});

//middleware
app.use(express.json());

app.use("/api/users", userRoutes)
app.use("/api/tasks", TaskRoutes)
app.use("/api/subtasks", SubTaskRoutes)

// Start cron jobs after database connection
DueTaskschedule.VoiceCallTasks(); // Call the overdue tasks cron job
ScheduleUpdateTaskPriorities.ScheduleUpdateTaskPriorities(); // Call the task priority update cron job