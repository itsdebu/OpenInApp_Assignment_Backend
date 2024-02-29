const { User, Task, SubTask } = require('../models')
const { getPriority } = require('../utils/priority')

// All Task Api's
const CreateTask = async (req, res) => {
    try {
        const { title, description, due_date } = req.body;

        // Basic validation
        if (!title || !description || !due_date) {
            return res.status(400).json({ error: 'Title, description, and due_date are required fields' });
        }

        const priority = getPriority(due_date);

        const dueDate = new Date(due_date);

        const newTask = new Task({
            title,
            description,
            due_date: dueDate,
            priority,
            user: req.user._id,
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
            updateData.priority = getPriority(due_date);
            updateData.due_date = due_date;
        }



        const task = await Task.findOneAndUpdate({ _id: task_id },
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

        // Assuming 'task_id' and 'user_id' are already defined
        let filterOptions = { _id: task_id, deleted_at: null };

        // Soft delete the task
        const result = await Task.updateOne(filterOptions, { $set: { deleted_at: new Date() } });

        if (result.n === 0) {
            // Handle the case where no task was found
            return res.status(404).json({ error: 'Task not found or unauthorized user' });
        }

        filterOptions = { task_id: task_id }; // Correct the filter for subtasks

        // Soft delete associated subtasks
        await SubTask.updateMany(filterOptions, { $set: { deleted_at: new Date() } });

        return res.status(200).json({ message: 'Task and associated subtasks deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getSoftDeletedTasks = async (req, res) => {
    try {
        const user_id = req.user._id;
        console.log(user_id);
        // Find all soft-deleted tasks for the user
        const softDeletedTasks = await Task.find({
            user: user_id,
            deleted_at: { $ne: null }, // Find tasks with non-null deleted_at (soft-deleted)
        });

        res.status(200).json({ softDeletedTasks });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        console.error(error);
    }
}


const getAllTasks = async (req, res) => {
    try {
        const user_id = req.user._id;

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


module.exports = { CreateTask, UpdateTask, DeleteTask, getSoftDeletedTasks, getAllTasks }