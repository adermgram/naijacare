import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Pill, 
  AlertTriangle,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading } = useQuery(
    'prescriptions',
    () => axios.get('/prescriptions').then(res => res.data),
    { refetchInterval: 60000 }
  );

  const prescriptions = prescriptionsData?.prescriptions || [];

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications?.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && prescription.isActive) ||
                         (filterStatus === 'inactive' && !prescription.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDownloadPDF = async (prescriptionId) => {
    try {
      const response = await axios.get(`/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      toast.error('Failed to download prescription');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 mt-1">
              {user?.role === 'doctor' ? 'Manage your prescriptions' : 'View your prescriptions'}
            </p>
          </div>
          {user?.role === 'doctor' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Prescription</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prescriptions</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Prescriptions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription, index) => (
              <motion.div
                key={prescription._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user?.role === 'doctor' ? prescription.patientId?.name : prescription.doctorId?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user?.role === 'doctor' ? 'Patient' : prescription.doctorId?.specialization}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.isActive)}`}>
                        {getStatusText(prescription.isActive)}
                      </span>
                    </div>

                    {prescription.diagnosis && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                        <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                      </div>
                    )}

                    {prescription.medications && prescription.medications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Medications:</p>
                        <div className="space-y-2">
                          {prescription.medications.slice(0, 3).map((medication, medIndex) => (
                            <div key={medIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                              <Pill className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{medication.name}</span>
                              <span>•</span>
                              <span>{medication.dosage}</span>
                              <span>•</span>
                              <span>{medication.frequency}</span>
                            </div>
                          ))}
                          {prescription.medications.length > 3 && (
                            <p className="text-sm text-gray-500">
                              +{prescription.medications.length - 3} more medications
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {prescription.warnings && prescription.warnings.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <p className="text-sm font-medium text-gray-700">Warnings:</p>
                        </div>
                        <div className="space-y-1">
                          {prescription.warnings.slice(0, 2).map((warning, warningIndex) => (
                            <p key={warningIndex} className="text-sm text-gray-600">• {warning}</p>
                          ))}
                          {prescription.warnings.length > 2 && (
                            <p className="text-sm text-gray-500">
                              +{prescription.warnings.length - 2} more warnings
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prescribed: {new Date(prescription.prescribedAt).toLocaleDateString()}</span>
                      </div>
                      {prescription.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expires: {new Date(prescription.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownloadPDF(prescription._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : user?.role === 'doctor' 
                  ? 'You haven\'t created any prescriptions yet'
                  : 'You don\'t have any prescriptions yet'
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.reduce((total, p) => total + (p.medications?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Prescriptions; 