const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// Doctor creates a prescription
router.post('/', authMiddleware, prescriptionController.createPrescription);

// Get prescriptions (different behavior for patients vs doctors)
router.get('/', authMiddleware, (req, res) => {
  if (req.user.role === 'patient') {
    return prescriptionController.getPatientPrescriptions(req, res);
  } else if (req.user.role === 'doctor') {
    return prescriptionController.getDoctorPrescriptions(req, res);
  } else {
    return res.status(403).json({ error: 'Unauthorized role' });
  }
});

// Get prescription by ID
router.get('/:prescriptionId', authMiddleware, prescriptionController.getPrescriptionById);

// Generate PDF for prescription
router.get('/:prescriptionId/pdf', authMiddleware, prescriptionController.generatePrescriptionPDF);

// Update prescription (doctors only)
router.put('/:prescriptionId', authMiddleware, prescriptionController.updatePrescription);

// Deactivate prescription (doctors only)
router.put('/:prescriptionId/deactivate', authMiddleware, prescriptionController.deactivatePrescription);

module.exports = router;