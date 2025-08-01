const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const { patientId, consultationId, medications, instructions, diagnosis, symptoms, followUpDate, warnings, labTests } = req.body;
    const { userId } = req.user;

    // Verify user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create prescriptions' });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify consultation exists and belongs to this doctor
    if (consultationId) {
      const consultation = await Consultation.findById(consultationId);
      if (!consultation || consultation.doctorId.toString() !== userId) {
        return res.status(404).json({ error: 'Consultation not found or unauthorized' });
      }
    }

    const prescription = new Prescription({
      doctorId: userId,
      patientId,
      consultationId,
      medications,
      instructions,
      diagnosis,
      symptoms,
      followUpDate,
      warnings,
      labTests,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await prescription.save();

    // Update consultation with prescription reference
    if (consultationId) {
      await Consultation.findByIdAndUpdate(consultationId, {
        prescription: prescription._id
      });
    }

    // Populate patient and doctor info
    await prescription.populate('patientId', 'name phone email dateOfBirth gender');
    await prescription.populate('doctorId', 'name specialization licenseNumber');

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescriptions for a patient
const getPatientPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, isActive } = req.query;

    const query = { patientId: userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'name specialization')
      .populate('consultationId', 'scheduledAt diagnosis')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescriptions created by a doctor
const getDoctorPrescriptions = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10, patientId } = req.query;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can access this endpoint' });
    }

    const query = { doctorId: userId };
    if (patientId) {
      query.patientId = patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name phone email')
      .populate('consultationId', 'scheduledAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { userId, role } = req.user;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name phone email dateOfBirth gender bloodGroup allergies medicalHistory')
      .populate('doctorId', 'name specialization licenseNumber experience')
      .populate('consultationId', 'scheduledAt diagnosis notes');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Verify user has permission to view this prescription
    if (role === 'doctor' && prescription.doctorId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'patient' && prescription.patientId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate PDF for prescription
const generatePrescriptionPDF = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { userId, role } = req.user;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name phone email dateOfBirth gender bloodGroup')
      .populate('doctorId', 'name specialization licenseNumber')
      .populate('consultationId', 'scheduledAt diagnosis');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Verify user has permission
    if (role === 'doctor' && prescription.doctorId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'patient' && prescription.patientId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescriptionId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(24).text('MEDICAL PRESCRIPTION', { align: 'center' });
    doc.moveDown();

    // Doctor Information
    doc.fontSize(16).text('Doctor Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${prescription.doctorId.name}`);
    doc.text(`Specialization: ${prescription.doctorId.specialization}`);
    doc.text(`License: ${prescription.doctorId.licenseNumber}`);
    doc.moveDown();

    // Patient Information
    doc.fontSize(16).text('Patient Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${prescription.patientId.name}`);
    doc.text(`Phone: ${prescription.patientId.phone}`);
    doc.text(`Date of Birth: ${prescription.patientId.dateOfBirth ? new Date(prescription.patientId.dateOfBirth).toLocaleDateString() : 'N/A'}`);
    doc.text(`Gender: ${prescription.patientId.gender || 'N/A'}`);
    doc.text(`Blood Group: ${prescription.patientId.bloodGroup || 'N/A'}`);
    doc.moveDown();

    // Consultation Information
    if (prescription.consultationId) {
      doc.fontSize(16).text('Consultation Details:', { underline: true });
      doc.fontSize(12).text(`Date: ${new Date(prescription.consultationId.scheduledAt).toLocaleDateString()}`);
      if (prescription.consultationId.diagnosis) {
        doc.text(`Diagnosis: ${prescription.consultationId.diagnosis}`);
      }
      doc.moveDown();
    }

    // Diagnosis
    if (prescription.diagnosis) {
      doc.fontSize(16).text('Diagnosis:', { underline: true });
      doc.fontSize(12).text(prescription.diagnosis);
      doc.moveDown();
    }

    // Symptoms
    if (prescription.symptoms && prescription.symptoms.length > 0) {
      doc.fontSize(16).text('Symptoms:', { underline: true });
      prescription.symptoms.forEach(symptom => {
        doc.fontSize(12).text(`• ${symptom}`);
      });
      doc.moveDown();
    }

    // Medications
    doc.fontSize(16).text('Medications:', { underline: true });
    prescription.medications.forEach((med, index) => {
      doc.fontSize(14).text(`${index + 1}. ${med.name}`, { underline: true });
      doc.fontSize(12).text(`   Dosage: ${med.dosage}`);
      doc.text(`   Frequency: ${med.frequency}`);
      doc.text(`   Duration: ${med.duration}`);
      doc.text(`   Quantity: ${med.quantity} ${med.unit}`);
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`);
      }
      doc.moveDown(0.5);
    });

    // Instructions
    if (prescription.instructions) {
      doc.fontSize(16).text('General Instructions:', { underline: true });
      doc.fontSize(12).text(prescription.instructions);
      doc.moveDown();
    }

    // Warnings
    if (prescription.warnings && prescription.warnings.length > 0) {
      doc.fontSize(16).text('Warnings:', { underline: true });
      prescription.warnings.forEach(warning => {
        doc.fontSize(12).text(`• ${warning}`);
      });
      doc.moveDown();
    }

    // Lab Tests
    if (prescription.labTests && prescription.labTests.length > 0) {
      doc.fontSize(16).text('Laboratory Tests:', { underline: true });
      prescription.labTests.forEach(test => {
        doc.fontSize(12).text(`• ${test.testName} - ${test.urgency}`);
        if (test.instructions) {
          doc.text(`  Instructions: ${test.instructions}`);
        }
      });
      doc.moveDown();
    }

    // Follow-up
    if (prescription.followUpDate) {
      doc.fontSize(16).text('Follow-up:', { underline: true });
      doc.fontSize(12).text(`Next appointment: ${new Date(prescription.followUpDate).toLocaleDateString()}`);
      doc.moveDown();
    }

    // Footer
    doc.fontSize(10).text(`Prescribed on: ${new Date(prescription.prescribedAt).toLocaleDateString()}`);
    doc.text(`Valid until: ${new Date(prescription.expiresAt).toLocaleDateString()}`);
    doc.moveDown();
    doc.text('This prescription is valid for 30 days from the date of issue.', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medications, instructions, diagnosis, followUpDate, warnings, labTests } = req.body;
    const { userId } = req.user;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can update prescriptions' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this prescription' });
    }

    // Update fields
    if (medications) prescription.medications = medications;
    if (instructions) prescription.instructions = instructions;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (followUpDate) prescription.followUpDate = followUpDate;
    if (warnings) prescription.warnings = warnings;
    if (labTests) prescription.labTests = labTests;

    await prescription.save();

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate prescription
const deactivatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { userId } = req.user;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can deactivate prescriptions' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.doctorId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to deactivate this prescription' });
    }

    prescription.isActive = false;
    await prescription.save();

    res.json({ message: 'Prescription deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  generatePrescriptionPDF,
  updatePrescription,
  deactivatePrescription
};