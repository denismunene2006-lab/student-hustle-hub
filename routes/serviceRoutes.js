const express = require('express');
const {
  getServices,
  createService,
  getMyServices,
  deleteService,
  getServiceById,
  updateService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getServices).post(protect, createService);
router.get('/my-services', protect, getMyServices);
router.route('/:id').get(getServiceById).put(protect, updateService).delete(protect, deleteService);

module.exports = router;
