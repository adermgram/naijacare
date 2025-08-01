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
  Search,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch consultations
  const { data: consultationsData, isLoading: consultationsLoading } = useQuery(
    'doctorConsultations',
    () => axios.get('/consultations').then(res => res.data),
    { refetchInterval: 30000 }
  );

  // Fetch prescriptions
  const { data: prescriptionsData, isLoading: prescriptionsLoading } = useQuery(
    'doctorPrescriptions',
    () => axios.get('/prescriptions').then(res => res.data),
    { refetchInterval: 60000 }
  );

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation(
    (available) => axios.put('/doctor/availability', { available }),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('doctorConsultations');
        toast.success(`You are now ${response.data.available ? 'available' : 'unavailable'}`);
      },
      onError: () => {
        toast.error('Failed to update availability');
      }
    }
  );

  const consultations = consultationsData?.consultations || [];
  const prescriptions = prescriptionsData?.prescriptions || [];

  const todayConsultations = consultations.filter(c => {
    const today = new Date().toDateString();
    const consultationDate = new Date(c.scheduledAt).toDateString();
    return consultationDate === today;
  });

  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && new Date(c.scheduledAt) > new Date()
  ).slice(0, 5);

  const recentConsultations = consultations
    .filter(c => c.status === 'completed')
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, 5);

  const pendingConsultations = consultations.filter(c => c.status === 'scheduled');

  const stats = [
    {
      title: 'Today\'s Consultations',
      value: todayConsultations.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Pending Consultations',
      value: pendingConsultations.length,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Prescriptions',
      value: prescriptions.length,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Average Rating',
      value: user?.rating || 0,
      icon: Star,
      color: 'bg-purple-500',
      suffix: '/5',
    },
  ];

  const handleToggleAvailability = () => {
    toggleAvailabilityMutation.mutate(!user?.available);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, Dr. {user?.name}!
            </h1>
            <p className="text-green-100">
              Manage your consultations, prescriptions, and patient care from your dashboard.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-green-100">Status</p>
              <p className={`font-semibold ${user?.available ? 'text-green-200' : 'text-red-200'}`}>
                {user?.available ? 'Available' : 'Unavailable'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={toggleAvailabilityMutation.isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                user?.available 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {toggleAvailabilityMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : user?.available ? (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  <span>Go Offline</span>
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4" />
                  <span>Go Online</span>
                </>
              )}
            </button>
          </div>
        </div>
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
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.suffix || ''}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Consultations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today's Consultations</h2>
              <Link
                to="/doctor/consultations"
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
            ) : todayConsultations.length > 0 ? (
              <div className="space-y-4">
                {todayConsultations.map((consultation) => (
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
                          {consultation.patientId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {consultation.type} consultation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(consultation.scheduledAt).toLocaleTimeString()}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        consultation.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        consultation.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No consultations scheduled for today</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Prescriptions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
              <Link
                to="/doctor/prescriptions"
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
            ) : prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.slice(0, 3).map((prescription) => (
                  <div
                    key={prescription._id}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {prescription.patientId?.name}
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
                <p className="text-gray-500">No prescriptions yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Consultations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Consultations</h2>
        </div>
        <div className="p-6">
          {consultationsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : upcomingConsultations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingConsultations.map((consultation) => (
                    <tr key={consultation._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {consultation.patientId?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consultation.patientId?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {consultation.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{new Date(consultation.scheduledAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(consultation.scheduledAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {consultation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            Start
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Reschedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming consultations</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorDashboard; 