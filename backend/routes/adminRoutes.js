const express = require('express');
const {
  getAdminStats,
  getAdminUsers,
  setUserAdmin,
  setUserSuspended,
  deleteUser,
  getAdminServices,
  deleteService,
  getAdminReviews,
  deleteReview,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { adminLimiter, writeLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

router.use(protect, admin, adminLimiter);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', writeLimiter, setUserAdmin);
router.put('/users/:id/suspend', writeLimiter, setUserSuspended);
router.delete('/users/:id', writeLimiter, deleteUser);
router.get('/services', getAdminServices);
router.delete('/services/:id', writeLimiter, deleteService);
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', writeLimiter, deleteReview);

module.exports = router;