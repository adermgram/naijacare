const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  passwordHash: { type: String, required: true },
  language: { type: String, default: 'English' },
  available: { type: Boolean, default: false },
  
  // Doctor specific fields
  specialization: { type: String },
  licenseNumber: { type: String },
  experience: { type: Number }, // years of experience
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  consultationFee: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  bio: { type: String },
  profileImage: { type: String },
  
  // Patient specific fields
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'resolved', 'chronic'] }
  }],
  allergies: [String],
  
  // Common fields
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  isVerified: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  
  // Settings
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { 
  timestamps: true 
});

// Index for better query performance
UserSchema.index({ role: 1, available: 1 });
UserSchema.index({ specialization: 1, available: 1 });

module.exports = mongoose.model('User', UserSchema);