const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsForUser,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public route to get all reviews for a specific user
router.get('/user/:id', getReviewsForUser);

// Private route to create a new review
router.post('/', protect, createReview);

router.delete('/:id', protect, deleteReview);

module.exports = router;