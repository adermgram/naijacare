const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  consultationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consultation' 
  },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true }, // e.g., "twice daily", "once daily"
    duration: { type: String, required: true }, // e.g., "7 days", "2 weeks"
    instructions: String, // e.g., "Take with food", "Take on empty stomach"
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'tablets' }, // tablets, capsules, ml, etc.
    beforeMeal: { type: Boolean, default: false },
    afterMeal: { type: Boolean, default: false }
  }],
  instructions: String,
  diagnosis: String,
  symptoms: [String],
  followUpDate: Date,
  isActive: { type: Boolean, default: true },
  refillCount: { type: Number, default: 0 },
  maxRefills: { type: Number, default: 0 },
  prescribedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  notes: String,
  warnings: [String], // e.g., "Avoid alcohol", "May cause drowsiness"
  allergies: [String],
  labTests: [{
    testName: String,
    instructions: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'emergency'] }
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
prescriptionSchema.index({ patientId: 1, isActive: 1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ consultationId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
