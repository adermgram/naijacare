const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  passwordHash: String,
  language: String,
  available: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);