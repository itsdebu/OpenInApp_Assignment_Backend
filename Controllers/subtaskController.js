const { User, Task, SubTask } = require('../models')

const createSubTask = async (req, res) => {
    try {
        const { task_id } = req.body;

        // Validate task_id
        if (!task_id) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        // Find the task by id and user_id
        const task = await Task.findOne({ _id: task_id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Create a subtask for the found task
        const subTask = await SubTask.create({ status: 0, task_id });

        if (task) {
            const subTasks = await SubTask.find({ task_id: task._id });

            // Check if any subtask has status 1
            const isInProgress = subTasks.some(subTask => subTask.status === 1);

            // Update task status based on subtasks
            task.status = isInProgress ? 'IN_PROGRESS' : 'TODO';

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
        const { status, subTaskId } = req.body;
        const user_id = req.user._id

        console.log(status, user_id, subTaskId);

        if (!subTaskId) {
            return res.status(400).json({
                message: 'subtask id is required'
            })
        }

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
            const subTasks = await SubTask.find({
                task_id: task._id,
                deleted_at: null,
            });

            // Check if any subtask has status 1
            const isInProgress = subTasks.some(subTask => subTask.status === 1);

            // Check if all subtasks are complete
            const allSubTasksComplete = subTasks.every(subTask => subTask.status === 1);

            // Update task status based on subtasks
            task.status = allSubTasksComplete ? 'DONE' : (isInProgress ? 'IN_PROGRESS' : 'TODO');

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
        const { subTaskId } = req.body;

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
        const remainingSubtasks = await SubTask.find({
            task_id: task._id,
            deleted_at: null,
        });

        // Update task status based on remaining subtasks
        if (remainingSubtasks.length > 0) {
            // If there are remaining subtasks, check if any of them has status 1
            const isDone = remainingSubtasks.every(subtask => subtask.status === 1);
            const isInProgress = remainingSubtasks.some(subtask => subtask.status === 1);

            if (isDone) {
                task.status = 'DONE';
            } else if (isInProgress) {
                // If all remaining subtasks have status 0, set task status to TODO
                task.status = 'IN_PROGRESS';
            }
        } else {
            // If there are no remaining subtasks, set task status to DONE
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
        const user_id = req.user._id;

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


const GetAllSubtasks = async (req, res) => {
    try {
        const user_id = req.user._id;
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

module.exports = { createSubTask, updateSubTask, deleteSubTask, getSoftDeletedSubtasks, GetAllSubtasks };
