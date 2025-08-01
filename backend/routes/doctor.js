const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const { toggleAvailability, getAvailableDoctors } = require('../controllers/authController');

// Toggle doctor availability
router.put('/availability', authMiddleware, toggleAvailability);

// Get available doctors
router.get('/available', getAvailableDoctors);

module.exports = router;