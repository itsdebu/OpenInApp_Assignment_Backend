const express = require("express")
const Task = require("../models/taskModel")
const User = require("../models/UserModel")


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
        if (isNaN(dueDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format for due_date' });
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

module.exports = { CreateTask };


const UpdateTask = async (req, res) => {
    try {
        const { due_date, status } = req.body;

        if (!due_date && !status) {
            return res.status(400).json({ error: 'Nothing is there to update, please provide some fields' });
        }

        const { task_id } = req.params;

        console.log(task_id, req.user._id, status)
        const task = await Task.findOne({ _id: task_id, user: req.user._id.toString() });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (due_date) {
            task.due_date = due_date;

            // Calculate priority based on due_date
            const currentDate = new Date();
            const dueDate = new Date(due_date);
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
        }

        if (status && (status === 'TODO' || status === 'DONE' || status === 'IN_PROGRESS')) {
            task.status = status;


        }
        else {
            return res.status(400).json({
                success: false,
                message: "status INVALID should be TODO , DONE or IN_PROGRESS"
            })
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
        console.log(task_id, user_id)

        // Find the task by id and user_id
        const task = await Task.findOne({ _id: task_id, user: user_id });

        if (!task) {
            return res.status(400).json({
                success: false,
                message: "Task not found or Unauthorized user"
            })
        }
        console.log(task)


        // Remove the task
        await task.deleteOne();

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        return res.status(404).json({ error })
    }
};


module.exports = { CreateTask, UpdateTask, DeleteTask }