const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'audio', 'video'], 
    default: 'text' 
  },
  fileUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);