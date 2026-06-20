const express = require('express');
const router = express.Router();
const {
  createJob,
  getMyJobs,
  getMyJobSummary,
  updateJobStatus,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createJob);
router.get('/my/summary', protect, getMyJobSummary);
router.get('/my', protect, getMyJobs);
router.put('/:id/status', protect, updateJobStatus);

module.exports = router;
