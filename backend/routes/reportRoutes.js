const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/securityMiddleware');

router.post('/', protect, writeLimiter, createReport);

module.exports = router;