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

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/role', setUserAdmin);
router.put('/users/:id/suspend', setUserSuspended);
router.delete('/users/:id', deleteUser);
router.get('/services', getAdminServices);
router.delete('/services/:id', deleteService);
router.get('/reviews', getAdminReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
