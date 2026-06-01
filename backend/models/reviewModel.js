const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // The user who is being reviewed
    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The user who wrote the review
    reviewerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The service this review is associated with
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Service',
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewedUserId: 1, createdAt: -1 });
reviewSchema.index({ serviceId: 1, reviewerUserId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
