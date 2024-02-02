const express = require("express")
const User = require("../models/UserModel")
const jwt = require("jsonwebtoken")
const Task = require("../models/taskModel")
const SubTask = require("../models/subtaskModel")



const UserSignup = async (req, res) => {
    const { phone_no, priority } = req.body;

    if (!phone_no || !priority) {
        return res.status(400).json({
            success: false,
            error: "phone_number and priority are required."
        });
    }

    // Validate phone_no as a string with length 10
    if (typeof phone_no !== 'string' || phone_no.length !== 10 || !/^\d+$/.test(phone_no)) {
        return res.status(400).json({
            success: false,
            error: "phone_number should be a string of length 10 containing only digits."
        });
    }

    // Validate priority as an integer within the allowed values [0, 1, 2]
    if (!Number.isInteger(Number(priority)) || ![0, 1, 2].includes(Number(priority))) {
        return res.status(400).json({
            success: false,
            error: "priority should be an integer and only 0, 1, or 2 are allowed."
        });
    }

    // Checking for user if the phone_no is already registered or not
    const existingUser = await User.findOne({ phone_no });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already registered with this phone_no."
        });
    }

    try {
        const newUser = new User({
            phone_no: phone_no,
            priority: priority,
        });

        const user = await newUser.save();

        // Generating jwt token
        const tokenPayload = { userId: newUser._id, phone_no: newUser.phone_no };
        const accessToken = jwt.sign(tokenPayload, process.env.SECRETKEY, {
            expiresIn: '1h' //update it accordingly, currenlty token expiery time is 1hour
        });

        return res.status(200).json({
            token: accessToken,
            user,
            success: true
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};



const UserLogin = async (req, res) => {

    const { phone_no } = req.body;

    if (!phone_no) {
        return res.stauts(400).json({
            success: false,
            error: "phone_number is required for login."
        })
    }

    if (typeof phone_no !== 'string' || phone_no.length !== 10 || !/^\d+$/.test(phone_no)) {
        return res.status(400).json({
            success: false,
            error: "phone_number should be a string of length 10 containing only digits."
        });
    }

    try {

        const user = await User.findOne({ phone_no });

        if (!user) {
            return res.status(400).json({
                status: false,
                error: "User with this phone no is not registered",
            })
        }

        // Generating jwt token
        const tokenPayload = { userId: user._id, phone_no: user.phone_number };
        const accessToken = jwt.sign(tokenPayload, process.env.SECRETKEY, { expiresIn: '365d' });


        res.status(200).json({
            message: "Logged In Successfully",
            user,
            token: accessToken,
            success: true
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            err
        });
    }
}


const getAllTasks = async (req, res) => {
    try {
        const user_id = req.user._id.toString();

        // Finding user by id
        const user = await User.findById(user_id);

        const { priority, due_date } = req.query;

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const filterOptions = {
            user: user.id,
            deleted_at: null, // Exclude soft-deleted tasks
        };

        if (priority !== undefined) {
            filterOptions.priority = priority;
        }

        if (due_date !== undefined) {
            // Parsing date object
            filterOptions.due_date = new Date(due_date);
        }

        console.log("Filter:", filterOptions);

        const tasks = await Task.find(filterOptions)
            // .populate({
            //     path: 'subTasks',
            //     match: { deleted_at: null }, // Exclude soft-deleted subtasks
            //     select: '_id', // Only include the _id field of subtasks
            // })
            .sort({ due_date: 1 }) // Sort by due_date, adjust as needed
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        // Extract and format subtask IDs as an array of strings
        // const formattedTasks = tasks.map(task => {
        //     return {
        //         ...task.toObject(),
        //         subTasks: task.subTasks.map(subtask => subtask._id.toString()),
        //     };
        // });

        // console.log("Formatted Tasks:", formattedTasks);

        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
};


const GetAllSubtasks = async (req, res) => {
    try {
        const user_id = req.user._id.toString();
        const { status, task_id } = req.query;

        // pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        if (!task_id) {
            return res.status(400).json({
                status: false,
                message: "task_id is required",
            });
        }

        // Use findById for querying by _id
        const task = await Task.findById(task_id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Check if the task has been deleted
        if (task.deleted_at !== null) {
            return res.status(400).json({
                success: false,
                message: "This task has been deleted",
            });
        }

        // Build the filter based on the provided status
        const filterOptions = { task_id: task._id, deleted_at: null };
        if (status !== undefined) {
            filterOptions.status = status;
        }

        // Find subtasks for the task
        const subTasks = await SubTask.find(filterOptions)
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        console.log(subTasks)

        res.status(200).json(subTasks);
    } catch (err) {
        return res.status(404).json({
            err,
        });
    }
};


module.exports = { GetAllSubtasks, getAllTasks, UserSignup, UserLogin };