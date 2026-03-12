const express = require('express');
const router = express.Router();
const { getUserProfileById } = require('../controllers/userController');

// Public route to get a user's profile by their ID
router.get('/:id', getUserProfileById);

module.exports = router;