const express = require('express');
const router = express.Router();
const { createSubTask, updateSubTask, deleteSubTask, getSoftDeletedSubtasks, GetAllSubtasks } = require('../Controllers/subtaskController');

// Create a new subtask
router.post('/create', createSubTask);

// Update an existing subtask
router.post('/update', updateSubTask);

// Delete a subtask
router.post('/delete', deleteSubTask);

// Get Deleted Subtasks
router.get('/deletedSubtasks/:task_id', getSoftDeletedSubtasks)

// Get all subtasks for a task
router.get("/all", GetAllSubtasks);

module.exports = router;
