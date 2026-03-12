const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, serviceId, reason, details } = req.body;

  if (!reportedUserId || !reason) {
    res.status(400);
    throw new Error('Reported user and reason are required');
  }

  if (String(reportedUserId) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot report yourself');
  }

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    res.status(404);
    throw new Error('Reported user not found');
  }

  let service = null;
  if (serviceId) {
    service = await Service.findById(serviceId);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
  }

  const cleanedReason = String(reason).trim();
  if (cleanedReason.length < 3) {
    res.status(400);
    throw new Error('Reason is too short');
  }

  const report = await Report.create({
    reporter: req.user._id,
    reportedUser: reportedUserId,
    service: service?._id ?? null,
    reason: cleanedReason,
    details: String(details ?? '').trim(),
  });

  res.status(201).json({ ok: true, id: report._id });
});

module.exports = { createReport };
