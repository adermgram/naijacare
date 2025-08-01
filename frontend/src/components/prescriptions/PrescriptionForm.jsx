import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  X, 
  Save, 
  Pill, 
  AlertTriangle, 
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const PrescriptionForm = ({ consultationId, patientId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    symptoms: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        unit: 'tablets',
        mealInstructions: 'after meals',
        notes: ''
      }
    ],
    labTests: [],
    warnings: [],
    followUpDate: '',
    notes: '',
    expiresAt: ''
  });

  const createPrescriptionMutation = useMutation(
    (data) => axios.post('/prescriptions', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prescriptions');
        toast.success('Prescription created successfully');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create prescription');
      }
    }
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: '',
          unit: 'tablets',
          mealInstructions: 'after meals',
          notes: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const addWarning = () => {
    const warning = prompt('Enter warning:');
    if (warning) {
      setFormData(prev => ({
        ...prev,
        warnings: [...prev.warnings, warning]
      }));
    }
  };

  const removeWarning = (index) => {
    const updatedWarnings = formData.warnings.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      warnings: updatedWarnings
    }));
  };

  const addLabTest = () => {
    const test = prompt('Enter lab test:');
    if (test) {
      setFormData(prev => ({
        ...prev,
        labTests: [...prev.labTests, test]
      }));
    }
  };

  const removeLabTest = (index) => {
    const updatedLabTests = formData.labTests.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      labTests: updatedLabTests
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const prescriptionData = {
        ...formData,
        consultationId,
        patientId,
        doctorId: user._id,
        prescribedAt: new Date(),
        isActive: true
      };

      await createPrescriptionMutation.mutateAsync(prescriptionData);
    } catch (error) {
      console.error('Error creating prescription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals'
  ];

  const unitOptions = [
    'tablets',
    'capsules',
    'ml',
    'mg',
    'g',
    'drops',
    'puffs',
    'units'
  ];

  const mealInstructions = [
    'before meals',
    'after meals',
    'with meals',
    'on empty stomach',
    'any time'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Prescription</h2>
                <p className="text-sm text-gray-500">Fill in the prescription details</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Diagnosis and Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis *
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter diagnosis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe symptoms"
              />
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <span>Medications</span>
              </h3>
              <button
                type="button"
                onClick={addMedication}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Medication</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.medications.map((medication, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name *
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Paracetamol"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <select
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 7 days"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={medication.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={medication.unit}
                        onChange={(e) => handleMedicationChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {unitOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meal Instructions
                      </label>
                      <select
                        value={medication.mealInstructions}
                        onChange={(e) => handleMedicationChange(index, 'mealInstructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {mealInstructions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={medication.notes}
                        onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional instructions..."
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Warnings</span>
              </h3>
              <button
                type="button"
                onClick={addWarning}
                className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Add Warning
              </button>
            </div>
            <div className="space-y-2">
              {formData.warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-yellow-600">•</span>
                  <span className="flex-1">{warning}</span>
                  <button
                    type="button"
                    onClick={() => removeWarning(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Tests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Lab Tests</h3>
              <button
                type="button"
                onClick={addLabTest}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Lab Test
              </button>
            </div>
            <div className="space-y-2">
              {formData.labTests.map((test, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-600">•</span>
                  <span className="flex-1">{test}</span>
                  <button
                    type="button"
                    onClick={() => removeLabTest(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional instructions or notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Creating...' : 'Create Prescription'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PrescriptionForm; 