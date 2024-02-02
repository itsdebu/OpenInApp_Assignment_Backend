const express = require("express")
const Task = require("../models/taskModel")
const User = require("../models/UserModel")
const SubTask = require("../models/subtaskModel")


const CreateTask = async (req, res) => {
    try {
        const { title, description, due_date } = req.body;

        // Basic validation
        if (!title || !description || !due_date) {
            return res.status(400).json({ error: 'Title, description, and due_date are required fields' });
        }

        // Validate user
        console.log('User ID:', req.user._id.toString()); // Check if the user ID is logged correctly
        const user = await User.findById(req.user._id.toString());

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentDate = new Date();
        const dueDate = new Date(due_date);

        // Check if the date is valid
        // YYYY-MM-DD
        if (isNaN(dueDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format for due_date should be in format YYYY-MM-DD ' });
        }


        const timeDifference = dueDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        let priority = 0;

        if (daysDifference <= 0) {
            priority = 0;
        } else if (daysDifference <= 2) {
            priority = 1;
        } else if (daysDifference <= 4) {
            priority = 2;
        } else if (daysDifference <= 5) {
            priority = 3;
        } else {
            priority = 3;
        }

        const newTask = new Task({
            title,
            description,
            due_date: dueDate,
            priority,
            user: req.user._id, // Use req.user._id consistently, assuming the 'user' field in Task model is for the User reference
        });

        await newTask.save();

        res.status(201).json({
            message: 'Task created successfully',
            task: newTask,
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const UpdateTask = async (req, res) => {
    try {
        const { due_date } = req.body;

        if (!due_date) {
            return res.status(400).json({ error: 'Nothing is there to update, please provide some fields' });
        }

        const { task_id } = req.params;

        if (!task_id) {
            return res.status(400).json({ error: 'Please provide task_id to update' });

        }

        console.log(task_id, req.user._id);


        const currentDate = new Date();
        const dueDate = new Date(due_date);

        // Check if the date is valid
        // YYYY-MM-DD
        if (isNaN(dueDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format for due_date should be in format YYYY-MM-DD ' });
        }

        // // Validate that due_date is in the future or today
        // if (dueDate < currentDate) {
        //     return res.status(400).json({ error: 'Due date must be in the future or today' });
        // }

        const task = await Task.findOne({ _id: task_id, user: req.user._id.toString() });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update task due_date
        task.due_date = due_date;

        // Recalculate priority based on due_date
        const timeDifference = dueDate.getTime() - currentDate.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        if (daysDifference <= 0) {
            task.priority = 0;
        } else if (daysDifference <= 2) {
            task.priority = 1;
        } else if (daysDifference <= 3) {
            task.priority = 2;
        } else if (daysDifference <= 5) {
            task.priority = 3;
        } else {
            // Handle cases where the due date is more than 5 days from today
            // You may adjust this logic based on your specific requirements
            task.priority = 3;
        }

        await task.save();
        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const DeleteTask = async (req, res, next) => {
    try {
        const task_id = req.params.task_id;
        const user_id = req.user._id.toString();

        // Find the task by id and user_id
        const task = await Task.findOne({ _id: task_id, user: user_id });

        if (!task) {
            return res.status(400).json({
                success: false,
                message: "Task not found or Unauthorized user"
            });
        }

        // Soft delete associated subtasks
        for (const subTaskId of task.subTasks) {
            const subTask = await SubTask.findOne({ _id: subTaskId });
            if (subTask) {
                subTask.deleted_at = new Date();
                await subTask.save();
            }
        }

        // Mark the task as deleted (soft deletion)
        task.deleted_at = new Date();
        await task.save();

        return res.status(200).json({ message: 'Task and associated subtasks deleted successfully' });
    } catch (error) {
        return res.status(404).json({ error });
    }
};

const getSoftDeletedTasks = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Find all soft-deleted tasks for the user
        const softDeletedTasks = await Task.find({
            user: user_id,
            deleted_at: { $ne: null }, // Find tasks with non-null deleted_at (soft-deleted)
        });

        res.status(200).json({ softDeletedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

module.exports = { CreateTask, UpdateTask, DeleteTask, getSoftDeletedTasks }