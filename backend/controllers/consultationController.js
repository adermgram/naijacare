const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// Get all consultations for a user (patient or doctor)
const getConsultations = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = role === 'doctor' 
      ? { doctorId: userId }
      : { patientId: userId };
    
    if (status) {
      query.status = status;
    }
    
    const consultations = await Consultation.find(query)
      .populate(role === 'doctor' ? 'patientId' : 'doctorId', 'name phone email profileImage')
      .populate('prescription')
      .sort({ scheduledAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Consultation.countDocuments(query);
    
    res.json({
      consultations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new consultation
const createConsultation = async (req, res) => {
  try {
    const { doctorId, scheduledAt, type, symptoms } = req.body;
    const { userId } = req.user;
    
    // Check if doctor is available
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor', available: true });
    if (!doctor) {
      return res.status(400).json({ error: 'Doctor is not available' });
    }
    
    // Check for scheduling conflicts
    const conflictingConsultation = await Consultation.findOne({
      doctorId,
      scheduledAt: {
        $gte: new Date(scheduledAt),
        $lt: new Date(new Date(scheduledAt).getTime() + 30 * 60000) // 30 minutes
      },
      status: { $in: ['scheduled', 'in-progress'] }
    });
    
    if (conflictingConsultation) {
      return res.status(400).json({ error: 'Doctor has a conflicting appointment at this time' });
    }
    
    const consultation = new Consultation({
      patientId: userId,
      doctorId,
      scheduledAt,
      type,
      symptoms,
      amount: doctor.consultationFee
    });
    
    await consultation.save();
    
    // Populate doctor info for response
    await consultation.populate('doctorId', 'name phone email specialization');
    
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update consultation status
const updateConsultationStatus = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status, notes, diagnosis } = req.body;
    const { userId, role } = req.user;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    // Verify user has permission to update this consultation
    if (role === 'doctor' && consultation.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'patient' && consultation.patientId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Update status and related fields
    consultation.status = status;
    if (notes) consultation.notes = notes;
    if (diagnosis) consultation.diagnosis = diagnosis;
    
    // Set start/end times based on status
    if (status === 'in-progress' && !consultation.startedAt) {
      consultation.startedAt = new Date();
    } else if (status === 'completed' && !consultation.endedAt) {
      consultation.endedAt = new Date();
      if (consultation.startedAt) {
        consultation.duration = Math.round((consultation.endedAt - consultation.startedAt) / 60000);
      }
    }
    
    await consultation.save();
    
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consultation details
const getConsultationById = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { userId, role } = req.user;
    
    const consultation = await Consultation.findById(consultationId)
      .populate('patientId', 'name phone email dateOfBirth gender medicalHistory allergies')
      .populate('doctorId', 'name phone email specialization experience bio rating')
      .populate('prescription');
    
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    // Verify user has permission to view this consultation
    if (role === 'doctor' && consultation.doctorId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'patient' && consultation.patientId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rate a consultation
const rateConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { rating, review } = req.body;
    const { userId } = req.user;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    if (consultation.patientId.toString() !== userId) {
      return res.status(403).json({ error: 'Only patients can rate consultations' });
    }
    
    if (consultation.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed consultations' });
    }
    
    consultation.rating = rating;
    if (review) consultation.review = review;
    
    await consultation.save();
    
    // Update doctor's average rating
    const doctorConsultations = await Consultation.find({
      doctorId: consultation.doctorId,
      status: 'completed',
      rating: { $exists: true, $ne: null }
    });
    
    const avgRating = doctorConsultations.reduce((sum, c) => sum + c.rating, 0) / doctorConsultations.length;
    
    await User.findByIdAndUpdate(consultation.doctorId, {
      rating: Math.round(avgRating * 10) / 10,
      totalConsultations: doctorConsultations.length
    });
    
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel consultation
const cancelConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { userId, role } = req.user;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    // Verify user has permission to cancel
    if (role === 'doctor' && consultation.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'patient' && consultation.patientId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (consultation.status !== 'scheduled') {
      return res.status(400).json({ error: 'Can only cancel scheduled consultations' });
    }
    
    consultation.status = 'cancelled';
    await consultation.save();
    
    res.json({ message: 'Consultation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConsultations,
  createConsultation,
  updateConsultationStatus,
  getConsultationById,
  rateConsultation,
  cancelConsultation
};
