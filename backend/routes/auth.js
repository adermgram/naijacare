const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile, 
  toggleAvailability,
  getAvailableDoctors 
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.put('/availability', authMiddleware, toggleAvailability);
router.get('/doctors/available', getAvailableDoctors);

module.exports = router;