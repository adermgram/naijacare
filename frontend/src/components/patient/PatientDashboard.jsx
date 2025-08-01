import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  FileText, 
  Phone, 
  Video, 
  MapPin,
  Star,
  Plus,
  Search
} from 'lucide-react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch consultations
  const { data: consultationsData, isLoading: consultationsLoading } = useQuery(
    'patientConsultations',
    () => axios.get('/consultations').then(res => res.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery(
    'patientPrescriptions',
    () => axios.get('/prescriptions').then(res => res.data),
    { refetchInterval: 60000 } // Refetch every minute
  );

  // Fetch available doctors
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery(
    'availableDoctors',
    () => axios.get('/doctors/available').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const consultations = consultationsData?.consultations || [];
  const prescriptions = prescriptionsData?.prescriptions || [];
  const doctors = doctorsData || [];

  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && new Date(c.scheduledAt) > new Date()
  ).slice(0, 3);

  const recentConsultations = consultations
    .filter(c => c.status === 'completed')
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, 5);

  const activePrescriptions = prescriptions.filter(p => p.isActive);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: 'Total Consultations',
      value: consultations.length,
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Prescriptions',
      value: activePrescriptions.length,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Upcoming Appointments',
      value: upcomingConsultations.length,
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Available Doctors',
      value: doctors.length,
      icon: User,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          How can we help you today? Find a doctor, schedule a consultation, or check your prescriptions.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Consultations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Consultations</h2>
              <Link
                to="/consultations"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {consultationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : upcomingConsultations.length > 0 ? (
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {consultation.doctorId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {consultation.doctorId?.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(consultation.scheduledAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(consultation.scheduledAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming consultations</p>
                <Link
                  to="/doctors"
                  className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-500"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Book a consultation
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Prescriptions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Prescriptions</h2>
              <Link
                to="/prescriptions"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {prescriptionsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : activePrescriptions.length > 0 ? (
              <div className="space-y-4">
                {activePrescriptions.slice(0, 3).map((prescription) => (
                  <div
                    key={prescription._id}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {prescription.doctorId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {prescription.medications?.length || 0} medications
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(prescription.prescribedAt).toLocaleDateString()}
                        </p>
                        <Link
                          to={`/prescriptions/${prescription._id}`}
                          className="text-sm text-green-600 hover:text-green-500 font-medium"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active prescriptions</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Find Doctors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Available Doctors</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="p-6">
          {doctorsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.slice(0, 6).map((doctor) => (
                <motion.div
                  key={doctor._id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {doctor.rating || 0} ({doctor.totalConsultations || 0} consultations)
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors">
                      Book Consultation
                    </button>
                    <button className="bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No doctors found matching your search' : 'No doctors available at the moment'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PatientDashboard; 