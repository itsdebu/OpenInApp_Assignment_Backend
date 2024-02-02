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
        const { due_date, status, task_id } = req.body;

        if (!due_date && !status) {
            return res.status(400).json({ error: 'Nothing is there to update, please provide some fields' });
        }

        if (status && (status !== 'DONE')) {
            return res.status(400).json({
                error: 'Status can only be updated to DONE'
            })
        }

        if (!task_id) {
            return res.status(400).json({ error: 'Please provide task_id to update' });

        }

        console.log(task_id, req.user._id);

        const updateData = {}

        if (status) {
            updateData.status = status;
        }

        if (due_date) {
            const currentDate = new Date();
            const dueDate = new Date(due_date);

            // Check if the date is valid
            // YYYY-MM-DD
            if (isNaN(dueDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format for due_date, should be in format YYYY-MM-DD' });
            }

            // Validate that due_date is in the future or today
            if (dueDate.getTime() < currentDate.getTime()) { // Fix: Use getTime() for comparison
                return res.status(400).json({ error: 'Due date must be in the future or today' });
            }

            // Recalculate priority based on due_date
            const timeDifference = dueDate.getTime() - currentDate.getTime();
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

            if (daysDifference <= 0) {
                updateData.priority = 0;
            } else if (daysDifference <= 2) {
                updateData.priority = 1;
            } else if (daysDifference <= 3) {
                updateData.priority = 2;
            } else if (daysDifference <= 5) {
                updateData.priority = 3;
            } else {
                // Handle cases where the due date is more than 5 days from today
                // You may adjust this logic based on your specific requirements
                updateData.priority = 3;
            }
            updateData.due_date = due_date;
        }



        const task = await Task.findOneAndUpdate({ _id: task_id, user: req.user._id },
            updateData,
            { new: true }
        );

        if (status) {
            await SubTask.updateMany({ task_id }, { status: 1 });
        }

        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const DeleteTask = async (req, res, next) => {
    try {
        const { task_id } = req.body;
        const user_id = req.user._id;

        // Assuming 'task_id' and 'user_id' are already defined
        let filterOptions = { _id: task_id, user: user_id, deleted_at: null };

        // Soft delete the task
        const result = await Task.updateOne(filterOptions, { $set: { deleted_at: new Date() } });

        if (result.n === 0) {
            // Handle the case where no task was found
            return res.status(404).json({ error: 'Task not found or unauthorized user' });
        }

        filterOptions = { task_id };

        // Soft delete associated subtasks
        await SubTask.updateMany(filterOptions, { $set: { deleted_at: new Date() } });

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