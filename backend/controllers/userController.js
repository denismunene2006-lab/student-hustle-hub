const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { normalizeKenyanPhone } = require('../utils/phone');

const setPublicCache = (res, maxAgeSeconds = 60) => {
  res.set('Cache-Control', `private, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 4}`);
};

// @desc    Get public user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfileById = asyncHandler(async (req, res) => {
  // We select only the fields that are safe to be public.
  // Exclude password, and potentially other sensitive fields.
  const user = await User.findById(req.params.id)
    .select('-password -isSuspended -suspensionReason')
    .lean();

  if (user) {
    const payload = { ...user };
    payload.whatsappNumber = normalizeKenyanPhone(payload.whatsappNumber) || '';
    setPublicCache(res, 60);
    res.json(payload);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUserProfileById };
