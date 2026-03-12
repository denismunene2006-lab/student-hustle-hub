const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  getMyServices,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// The order of routes is important. More specific routes should come first.

// Private route for fetching user's own services
// Matches GET /api/services/my-services
router.get('/my-services', protect, getMyServices);

// Public route to get all services (with filters)
router.get('/', getServices);

// Private route to create a new service
router.post('/', protect, createService);

// Routes for a specific service by ID
router
  .route('/:id')
  .get(getServiceById) // Public
  .put(protect, updateService) // Private
  .delete(protect, deleteService); // Private

module.exports = router;