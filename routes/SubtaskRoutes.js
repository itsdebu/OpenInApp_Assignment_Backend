const express = require('express');
const router = express.Router();
const { createSubTask, updateSubTask, deleteSubTask, getSoftDeletedSubtasks } = require('../Controllers/subtaskController');
const { validateToken } = require('../middlewares/validateTokenHandler')

// Create a new subtask
router.post('/create', validateToken, createSubTask);

// Update an existing subtask
router.put('/update/:subTaskId', validateToken, updateSubTask);

// Delete a subtask
router.delete('/delete/:subTaskId', validateToken, deleteSubTask);

// Get Deleted Subtasks
router.get('/deletedSubtasks/:task_id', validateToken, getSoftDeletedSubtasks)

module.exports = router;
