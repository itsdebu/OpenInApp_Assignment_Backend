const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    due_date: {
        type: Date,
        required: true,
        // default: null,
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'DONE'],
        default: 'TODO',
    },
    priority: {
        type: Number,
        enum: [0, 1, 2, 3],  // Allowed values 0, 1, 2, 3
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
