const express = require('express');
const router = express.Router();
const {
  createPrompt, getPrompts, getPrompt, updatePrompt, deletePrompt,
  toggleFavorite, duplicatePrompt, getStats
} = require('../controllers/promptController');
const { protect } = require('../middleware/auth');
const { promptValidation } = require('../middleware/validation');

router.use(protect);

router.get('/stats', getStats);
router.post('/duplicate/:id', duplicatePrompt);
router.put('/favorite/:id', toggleFavorite);

router.route('/')
  .get(getPrompts)
  .post(promptValidation, createPrompt);

router.route('/:id')
  .get(getPrompt)
  .put(updatePrompt)
  .delete(deletePrompt);

module.exports = router;
