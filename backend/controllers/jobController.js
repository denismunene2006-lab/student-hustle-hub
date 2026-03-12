const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Service = require('../models/Service');

const STATUS_FLOW = ['requested', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'];

const buildJobPopulate = (query) =>
  query
    .populate('service', 'title category price listingType')
    .populate('buyer', 'name email university image')
    .populate('seller', 'name email university image');

const roleForUser = (job, userId) => {
  if (job.buyer.toString() === userId.toString()) return 'buyer';
  if (job.seller.toString() === userId.toString()) return 'seller';
  return null;
};

const allowedTransitions = (currentStatus, role) => {
  const map = {
    requested: {
      buyer: ['cancelled'],
      seller: ['accepted', 'cancelled'],
    },
    accepted: {
      buyer: ['cancelled'],
      seller: ['in_progress', 'delivered', 'cancelled'],
    },
    in_progress: {
      buyer: ['cancelled'],
      seller: ['delivered', 'cancelled'],
    },
    delivered: {
      buyer: ['completed', 'disputed'],
      seller: ['disputed'],
    },
    completed: {
      buyer: [],
      seller: [],
    },
    cancelled: {
      buyer: [],
      seller: [],
    },
    disputed: {
      buyer: [],
      seller: [],
    },
  };
  return map[currentStatus]?.[role] ?? [];
};

// @desc    Create a job request
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  const { serviceId, note } = req.body;

  if (!serviceId) {
    res.status(400);
    throw new Error('Service ID is required');
  }

  const service = await Service.findById(serviceId).populate('user', '_id');
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  const isBuyerListing = service.listingType === 'buyer';
  const buyerId = isBuyerListing ? service.user._id : req.user._id;
  const sellerId = isBuyerListing ? req.user._id : service.user._id;

  if (buyerId.toString() === sellerId.toString()) {
    res.status(400);
    throw new Error('You cannot create a job with yourself');
  }

  const existing = await Job.findOne({
    service: service._id,
    buyer: buyerId,
    seller: sellerId,
    status: { $nin: ['completed', 'cancelled'] },
  });

  if (existing) {
    const populatedExisting = await buildJobPopulate(Job.findById(existing._id));
    return res.status(200).json(populatedExisting);
  }

  const job = await Job.create({
    service: service._id,
    serviceSnapshot: {
      title: service.title,
      category: service.category,
      price: Number(service.price ?? 0),
      listingType: service.listingType === 'buyer' ? 'buyer' : 'seller',
    },
    buyer: buyerId,
    seller: sellerId,
    note: String(note ?? '').trim(),
    status: 'requested',
    lastActionBy: req.user._id,
  });

  const populatedJob = await buildJobPopulate(Job.findById(job._id));
  res.status(201).json(populatedJob);
});

// @desc    Get jobs for the logged-in user
// @route   GET /api/jobs/my
// @access  Private
const getMyJobs = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filters = [];

  if (role === 'buyer') {
    filters.push({ buyer: req.user._id });
  } else if (role === 'seller') {
    filters.push({ seller: req.user._id });
  } else {
    filters.push({ buyer: req.user._id });
    filters.push({ seller: req.user._id });
  }

  const query = { $or: filters };

  if (status && STATUS_FLOW.includes(status)) {
    query.status = status;
  }

  const jobs = await buildJobPopulate(
    Job.find(query).sort({ updatedAt: -1, createdAt: -1 })
  );

  res.status(200).json(jobs);
});

// @desc    Update job status
// @route   PUT /api/jobs/:id/status
// @access  Private
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !STATUS_FLOW.includes(status)) {
    res.status(400);
    throw new Error('Invalid status update');
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  const role = roleForUser(job, req.user._id);
  if (!role) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const allowed = allowedTransitions(job.status, role);
  if (!allowed.includes(status)) {
    res.status(403);
    throw new Error('Status change not allowed');
  }

  job.status = status;
  job.lastActionBy = req.user._id;
  await job.save();

  const populatedJob = await buildJobPopulate(Job.findById(job._id));
  res.status(200).json(populatedJob);
});

module.exports = {
  createJob,
  getMyJobs,
  updateJobStatus,
};
