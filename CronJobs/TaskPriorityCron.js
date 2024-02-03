const cron = require('node-cron');
require('dotenv').config();
const Task = require('../models/taskModel');
const { getPriority } = require('../utils/priority')

const UpdateTaskPriority = async () => {
    console.log(`Task priorities updated at ${new Date()}`);

    try {
        const tasks = await Task.find({ deleted_at: null });
        for (const task of tasks) {
            const newPriority = getPriority(task.due_date);

            await Task.findByIdAndUpdate(task._id, { priority: newPriority });
            console.log('Task priorities updated successfully.');
        }
    } catch (error) {
        console.error('Error updating task priorities:', error);
    }
};

// Schedule the task priority update cron job
const ScheduleUpdateTaskPriorities = () => {
    cron.schedule('0 */12 * * *', () => {
        UpdateTaskPriority();
    }, { timezone: 'Asia/Kolkata', scheduled: true });
}

module.exports = {
    ScheduleUpdateTaskPriorities,
}