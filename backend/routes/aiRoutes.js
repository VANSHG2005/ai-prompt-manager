const express = require('express');
const router = express.Router();
const { generatePrompt, improvePrompt, generateVariations, suggestTags, generateTitle } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

router.post('/generate', generatePrompt);
router.post('/improve', improvePrompt);
router.post('/variations', generateVariations);
router.post('/suggest-tags', suggestTags);
router.post('/generate-title', generateTitle);

module.exports = router;
