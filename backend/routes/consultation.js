const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const consultationController = require('../controllers/consultationController');

// Get all consultations for the authenticated user
router.get('/', authMiddleware, consultationController.getConsultations);

// Create a new consultation
router.post('/', authMiddleware, consultationController.createConsultation);

// Get consultation by ID
router.get('/:consultationId', authMiddleware, consultationController.getConsultationById);

// Update consultation status
router.put('/:consultationId/status', authMiddleware, consultationController.updateConsultationStatus);

// Rate a consultation
router.post('/:consultationId/rate', authMiddleware, consultationController.rateConsultation);

// Cancel consultation
router.put('/:consultationId/cancel', authMiddleware, consultationController.cancelConsultation);

module.exports = router;
