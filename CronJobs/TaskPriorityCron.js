const cron = require('node-cron');
const Task = require('../models/taskModel'); // Assuming you have a Mongoose model for Task
require('dotenv').config();

const UpdateTaskPriority = async () => {
    console.log(`Task priorities updated at ${new Date()}`);

    try {
        const tasks = await Task.find({ deleted_at: null });
        for (const task of tasks) {
            const currentDate = new Date();
            const dueDate = new Date(task.due_date);
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
                // Handle cases where the due date is more than 5 days from today
                priority = 3;
            }
            const newPriority = priority;

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