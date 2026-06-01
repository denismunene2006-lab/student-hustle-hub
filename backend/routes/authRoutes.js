const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  updateMe,
  updatePassword,
  checkEmailExists,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').trim().not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 8 or more characters').isLength({ min: 8 }),
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

router.post(
  '/google',
  [
    check('credential', 'Google credential is required').not().isEmpty(),
  ],
  googleAuth
);

router.get('/exists', checkEmailExists);

router.route('/me').get(protect, getMe).put(protect, updateMe);
router.put(
  '/password',
  [
    protect,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'Password must be 8 or more characters').isLength({ min: 8 }),
  ],
  updatePassword
);

module.exports = router;
