const Task = require("../models/taskModel")
const SubTask = require('../models/subtaskModel');

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

        console.log(status, user_id, subTaskId)

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

        res.status(200).json(subTask);
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

        await subTask.deleteOne();

        res.status(200).json({ message: 'SubTask deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { createSubTask, updateSubTask, deleteSubTask };
