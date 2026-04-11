const express = require('express');
const router = express.Router();
const { bulkDelete, bulkTag, bulkFavorite, bulkExport } = require('../controllers/bulkController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/delete',   bulkDelete);
router.post('/tag',      bulkTag);
router.post('/favorite', bulkFavorite);
router.post('/export',   bulkExport);

module.exports = router;
