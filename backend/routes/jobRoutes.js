const express = require('express');
const router = express.Router();
const {
  createJob,
  getMyJobs,
  updateJobStatus,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createJob);
router.get('/my', protect, getMyJobs);
router.put('/:id/status', protect, updateJobStatus);

module.exports = router;
