const asyncHandler = require('express-async-handler');
const Review = require('../models/reviewModel');
const Service = require('../models/Service');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, reviewedUserId, serviceId } = req.body;

  if (!rating || !comment || !reviewedUserId || !serviceId) {
    res.status(400);
    throw new Error('Please provide rating, comment, user ID, and service ID');
  }

  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check if the user being reviewed is the owner of the service
  if (service.user.toString() !== reviewedUserId) {
    res.status(400);
    throw new Error('Review mismatch: The user being reviewed does not own this service.');
  }

  // Prevent users from reviewing themselves
  if (req.user._id.toString() === reviewedUserId) {
    res.status(400);
    throw new Error('You cannot review your own service.');
  }

  const alreadyReviewed = await Review.findOne({
    serviceId,
    reviewerUserId: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this service.');
  }

  const review = await Review.create({
    rating: Number(rating),
    comment,
    reviewedUserId,
    serviceId,
    reviewerUserId: req.user._id,
  });

  res.status(201).json(review);
});

// @desc    Get reviews for a specific user
// @route   GET /api/reviews/user/:id
// @access  Public
const getReviewsForUser = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewedUserId: req.params.id })
    .populate('reviewerUserId', 'name image')
    .sort({ createdAt: -1 });

  // Map to the format the frontend expects
  const formattedReviews = reviews.map(r => ({
    _id: r._id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    reviewerName: r.reviewerUserId.name,
    reviewerUserId: r.reviewerUserId._id,
  }));

  res.json(formattedReviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.reviewerUserId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

module.exports = { createReview, getReviewsForUser, deleteReview };