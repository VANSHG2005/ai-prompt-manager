const express = require('express');
const router  = express.Router();
const {
  getWorkflows, createWorkflow, getWorkflow,
  updateWorkflow, deleteWorkflow, recordRun,
} = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getWorkflows)
  .post(createWorkflow);

router.route('/:id')
  .get(getWorkflow)
  .put(updateWorkflow)
  .delete(deleteWorkflow);

router.post('/:id/run', recordRun);

module.exports = router;
