// routes/chat.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const Consultation = require('../models/Consultation');

// Send a message in a consultation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { consultationId, content, messageType = 'text', fileUrl } = req.body;
    const { userId } = req.user;

    // Verify consultation exists and user is part of it
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.patientId.toString() !== userId && consultation.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to send messages in this consultation' });
    }

    const message = new Message({
      consultationId,
      senderId: userId,
      content,
      messageType,
      fileUrl
    });

    await message.save();

    // Populate sender info
    await message.populate('senderId', 'name');

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.to(`consultation_${consultationId}`).emit('newMessage', {
        message: {
          _id: message._id,
          consultationId: message.consultationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          fileUrl: message.fileUrl,
          timestamp: message.timestamp,
          isRead: message.isRead
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for a consultation
router.get('/:consultationId', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { userId } = req.user;

    // Verify consultation exists and user is part of it
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.patientId.toString() !== userId && consultation.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to view messages in this consultation' });
    }

    const messages = await Message.find({ consultationId })
      .populate('senderId', 'name')
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Mark messages as read
router.put('/:consultationId/read', authMiddleware, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { userId } = req.user;

    // Verify consultation exists and user is part of it
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.patientId.toString() !== userId && consultation.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark unread messages as read
    await Message.updateMany(
      { 
        consultationId, 
        senderId: { $ne: userId },
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;