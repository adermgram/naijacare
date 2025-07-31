const express = require('express');
const User = require('../models/User'); 
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");

router.put('/availability', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findByIdAndUpdate(req.user.userId, { available: req.body.available }, { new: true });
    res.json({ available: user.available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available doctors
router.get('/available', async (req, res) => {
  const doctors = await User.find({ role: 'doctor', available: true }, { name: 1, phone: 1, language: 1 });
  res.json(doctors);
});

module.exports = router;