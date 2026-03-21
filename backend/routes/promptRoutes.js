const express = require('express');
const router  = express.Router();
const {
  createPrompt, getPrompts, getPrompt, updatePrompt, deletePrompt,
  toggleFavorite, duplicatePrompt, getStats,
} = require('../controllers/promptController');
const { getVersions, restoreVersion, deleteVersion } = require('../controllers/versionController');
const { createShareLink, revokeShareLink, getShareStatus } = require('../controllers/shareController');
const { ratePrompt, recordUsage } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');
const { promptValidation } = require('../middleware/validation');

router.use(protect);

// Stats & special actions
router.get('/stats', getStats);
router.post('/duplicate/:id', duplicatePrompt);
router.put('/favorite/:id', toggleFavorite);

// Rating & usage tracking
router.put('/:id/rating', ratePrompt);
router.post('/:id/use', recordUsage);

// Version history
router.get('/:id/versions', getVersions);
router.post('/:id/versions/:versionId/restore', restoreVersion);
router.delete('/:id/versions/:versionId', deleteVersion);

// Sharing
router.post('/:id/share', createShareLink);
router.delete('/:id/share', revokeShareLink);
router.get('/:id/share', getShareStatus);

// CRUD
router.route('/')
  .get(getPrompts)
  .post(promptValidation, createPrompt);

router.route('/:id')
  .get(getPrompt)
  .put(updatePrompt)
  .delete(deletePrompt);

module.exports = router;
