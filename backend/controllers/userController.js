const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get public user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserProfileById = asyncHandler(async (req, res) => {
  // We select only the fields that are safe to be public.
  // Exclude password, and potentially other sensitive fields.
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUserProfileById };