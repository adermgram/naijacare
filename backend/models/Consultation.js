const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'], 
    default: 'scheduled' 
  },
  type: { 
    type: String, 
    enum: ['chat', 'video', 'voice', 'in-person'], 
    default: 'chat' 
  },
  scheduledAt: { 
    type: Date, 
    required: true 
  },
  startedAt: { 
    type: Date 
  },
  endedAt: { 
    type: Date 
  },
  duration: { 
    type: Number // in minutes
  },
  symptoms: [String],
  diagnosis: String,
  notes: String,
  prescription: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Prescription' 
  },
  followUpDate: { 
    type: Date 
  },
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  review: String,
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded'], 
    default: 'pending' 
  },
  amount: { 
    type: Number, 
    default: 0 
  },
  meetingLink: String,
  roomId: String
}, { 
  timestamps: true 
});

// Indexes for better query performance
ConsultationSchema.index({ patientId: 1, status: 1 });
ConsultationSchema.index({ doctorId: 1, status: 1 });
ConsultationSchema.index({ scheduledAt: 1 });
ConsultationSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('Consultation', ConsultationSchema);
