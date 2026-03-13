const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Service = require('../models/Service');
const Review = require('../models/reviewModel');
const Job = require('../models/Job');
const Report = require('../models/Report');

const mapUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  university: user.university,
  course: user.course,
  image: user.image ?? '',
  whatsappNumber: user.whatsappNumber ?? '',
  bio: user.bio ?? '',
  marketMode: user.marketMode ?? 'seller',
  isAdmin: Boolean(user.isAdmin),
  isSuspended: Boolean(user.isSuspended),
  suspensionReason: user.suspensionReason ?? '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    usersCount,
    activeUsers,
    servicesCount,
    reviewsCount,
    buyersCount,
    sellersCount,
    avgRatingAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } }),
    Service.countDocuments(),
    Review.countDocuments(),
    Service.countDocuments({ listingType: 'buyer' }),
    Service.countDocuments({ listingType: { $ne: 'buyer' } }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  const averageRating = avgRatingAgg?.[0]?.avg ?? 0;

  res.json({
    usersCount,
    activeUsers,
    servicesCount,
    reviewsCount,
    buyersCount,
    sellersCount,
    averageRating: Number.isFinite(averageRating) ? averageRating : 0,
  });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Admin
const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ updatedAt: -1, createdAt: -1 });
  res.json(users.map(mapUser));
});

// @desc    Set admin role for a user
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const setUserAdmin = asyncHandler(async (req, res) => {
  const targetId = String(req.params.id ?? '').trim();
  if (!targetId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  if (String(req.user._id) === targetId) {
    res.status(400);
    throw new Error('You cannot change your own admin role');
  }

  const user = await User.findById(targetId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const enabled = Boolean(req.body?.isAdmin);
  user.isAdmin = enabled;
  await user.save();

  res.json(mapUser(user));
});

// @desc    Suspend or unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin
const setUserSuspended = asyncHandler(async (req, res) => {
  const targetId = String(req.params.id ?? '').trim();
  if (!targetId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  if (String(req.user._id) === targetId) {
    res.status(400);
    throw new Error('You cannot suspend your own account');
  }

  const user = await User.findById(targetId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const shouldSuspend = Boolean(req.body?.isSuspended);
  const reason = String(req.body?.reason ?? '').trim();
  user.isSuspended = shouldSuspend;
  user.suspensionReason = shouldSuspend ? reason : '';
  await user.save();

  res.json(mapUser(user));
});

// @desc    Delete a user and related data
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const targetId = String(req.params.id ?? '').trim();
  if (!targetId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  if (String(req.user._id) === targetId) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  const user = await User.findById(targetId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const services = await Service.find({ user: user._id }).select('_id');
  const serviceIds = services.map((service) => service._id);

  const serviceFilter = serviceIds.length ? { service: { $in: serviceIds } } : null;

  await Promise.all([
    Review.deleteMany({
      $or: [
        { reviewedUserId: user._id },
        { reviewerUserId: user._id },
        ...(serviceFilter ? [{ serviceId: { $in: serviceIds } }] : []),
      ],
    }),
    Job.deleteMany({
      $or: [
        { buyer: user._id },
        { seller: user._id },
        ...(serviceFilter ? [serviceFilter] : []),
      ],
    }),
    Report.deleteMany({
      $or: [
        { reporter: user._id },
        { reportedUser: user._id },
        ...(serviceFilter ? [serviceFilter] : []),
      ],
    }),
    Service.deleteMany({ user: user._id }),
  ]);

  await user.deleteOne();

  res.json({ message: 'User removed' });
});

// @desc    Get all services for admin
// @route   GET /api/admin/services
// @access  Admin
const getAdminServices = asyncHandler(async (req, res) => {
  const services = await Service.find()
    .populate('user', 'name email university image')
    .sort({ createdAt: -1 });
  res.json(services);
});

// @desc    Delete a service (admin)
// @route   DELETE /api/admin/services/:id
// @access  Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await Promise.all([
    Review.deleteMany({ serviceId: service._id }),
    Job.deleteMany({ service: service._id }),
    Report.deleteMany({ service: service._id }),
  ]);

  await service.deleteOne();
  res.json({ message: 'Service removed' });
});

// @desc    Get all reviews for admin
// @route   GET /api/admin/reviews
// @access  Admin
const getAdminReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('reviewerUserId', 'name image')
    .populate('reviewedUserId', 'name image')
    .sort({ createdAt: -1 });

  const formatted = reviews.map((review) => ({
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    reviewerName: review.reviewerUserId?.name,
    reviewer: review.reviewerUserId,
    reviewedUser: review.reviewedUserId,
    serviceId: review.serviceId,
  }));

  res.json(formatted);
});

// @desc    Delete a review (admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

module.exports = {
  getAdminStats,
  getAdminUsers,
  setUserAdmin,
  setUserSuspended,
  deleteUser,
  getAdminServices,
  deleteService,
  getAdminReviews,
  deleteReview,
};
