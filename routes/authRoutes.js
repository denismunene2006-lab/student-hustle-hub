const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').trim().not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('university', 'University is required').trim().not().isEmpty(),
    check('course', 'Course is required').trim().not().isEmpty(),
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
  ],
  loginUser
);

router.route('/me').get(protect, getMe).put(protect, updateMe);

module.exports = router;
