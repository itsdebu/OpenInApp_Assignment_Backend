const Task = require("../models/taskModel")
const SubTask = require('../models/subtaskModel');
const User = require('../models/UserModel')

const createSubTask = async (req, res) => {
    try {
        const { task_id } = req.body;
        const user_id = req.user._id.toString();

        // Validate task_id
        if (!task_id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        // Find the task by id and user_id
        const task = await Task.findOne({ _id: task_id, user: user_id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or unauthorized user' });
        }

        // Create a subtask for the found task
        const subTask = await SubTask.create({ status: 0, task_id });

        // Attach the subtask to the task
        task.subTasks.push(subTask._id);
        await task.save();

        if (task) {
            const subTasks = await SubTask.find({ task_id: task._id });
            const allSubTasksComplete = subTasks.every(subTask => subTask.status === 1);

            if (allSubTasksComplete) {
                task.status = 'DONE';
            } else if (subTasks.some(subTask => subTask.status === 1)) {
                task.status = 'IN_PROGRESS';
            } else {
                task.status = 'TODO';
            }

            await task.save();
        }

        res.status(201).json(subTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateSubTask = async (req, res) => {
    try {
        const { status } = req.body;
        const user_id = req.user._id.toString();
        const subTaskId = req.params.subTaskId;

        console.log(status, user_id, subTaskId);

        // Validate status
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ message: 'Invalid status value should be 0 or 1' });
        }

        // Find the subtask by id and user_id
        const subTask = await SubTask.findOne({ _id: subTaskId });

        if (!subTask) {
            return res.status(404).json({ message: 'SubTask not found or unauthorized user' });
        }

        subTask.status = status;
        await subTask.save();

        // Update the parent task status based on subtask statuses
        const task = await Task.findById(subTask.task_id);

        if (task) {
            const subTasks = await SubTask.find({ task_id: task._id });
            const allSubTasksComplete = subTasks.every(subTask => subTask.status === 1);

            if (allSubTasksComplete) {
                task.status = 'DONE';
            } else if (subTasks.some(subTask => subTask.status === 1)) {
                task.status = 'IN_PROGRESS';
            } else {
                task.status = 'TODO';
            }

            await task.save();
        }

        res.status(200).json({
            message: "Subtask Updated Successfully",
            subTask
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const deleteSubTask = async (req, res) => {
    try {
        const user_id = req.user.id;
        const subTaskId = req.params.subTaskId;

        // Find the subtask by id and user_id
        const subTask = await SubTask.findOne({ _id: subTaskId });

        if (!subTask) {
            return res.status(404).json({ message: 'SubTask not found or unauthorized user' });
        }

        const task_id = subTask.task_id;

        const task = await Task.findById(task_id);

        // Performing Soft Deletion
        subTask.deleted_at = new Date();
        await subTask.save();

        // Checking if there are any remaining non-deleted subtasks
        const remainingSubtasks = await SubTask.findOne({
            task_id: task._id,
            deleted_at: null,
        });

        // Update task status based on remaining subtasks
        if (!remainingSubtasks) {
            task.status = 'TODO';
        }

        // Save the updated task status
        await task.save();

        res.status(200).json({ message: 'SubTask deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSoftDeletedSubtasks = async (req, res) => {
    try {
        const user_id = req.user.id;

        const user = await User.findOne({ _id: user_id });

        console.log(user_id, user)

        if (!user) {
            return res.status(400).json({
                message: "User not found in the database"
            })
        }

        const task_Id = req.params.task_id;

        // Find all soft-deleted subtasks for the user
        const softDeletedSubtasks = await SubTask.find({
            task_id: task_Id,
            deleted_at: { $ne: null }, // Find subtasks with non-null deleted_at (soft-deleted)
        });

        console.log(user_id, softDeletedSubtasks)

        res.status(200).json({ softDeletedSubtasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { createSubTask, updateSubTask, deleteSubTask, getSoftDeletedSubtasks };
