const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
  try {
    const { name, phone, password, role, specialization, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      name,
      phone,
      passwordHash,
      role: role || 'patient',
      email
    };

    // Add doctor-specific fields if role is doctor
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.available = false;
      userData.consultationFee = 0;
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, specialization, experience, bio, consultationFee, address, notifications } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (specialization) updateData.specialization = specialization;
    if (experience) updateData.experience = experience;
    if (bio) updateData.bio = bio;
    if (consultationFee) updateData.consultationFee = consultationFee;
    if (address) updateData.address = address;
    if (notifications) updateData.notifications = notifications;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Toggle doctor availability
const toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can toggle availability' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.available = !user.available;
    await user.save();

    res.json({ 
      message: `Doctor is now ${user.available ? 'available' : 'unavailable'}`,
      available: user.available 
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};

// Get available doctors
const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor', 
      available: true 
    }).select('-passwordHash');

    res.json(doctors);
  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({ error: 'Failed to get available doctors' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  toggleAvailability,
  getAvailableDoctors
};