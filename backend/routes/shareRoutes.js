const express = require('express');
const router  = express.Router();
const { viewSharedPrompt } = require('../controllers/shareController');

// Public — no auth middleware
router.get('/:token', viewSharedPrompt);

module.exports = router;
