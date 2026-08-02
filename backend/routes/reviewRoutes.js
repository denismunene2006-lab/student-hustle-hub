const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsForUser,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
const { writeLimiter } = require('../middleware/securityMiddleware');

// Public route to get all reviews for a specific user
router.get('/user/:id', getReviewsForUser);

// Private route to create a new review
router.post('/', protect, writeLimiter, createReview);

router.delete('/:id', protect, admin, writeLimiter, deleteReview);

module.exports = router;