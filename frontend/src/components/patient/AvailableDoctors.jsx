import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Video, 
  MessageSquare, 
  MapPin, 
  Clock,
  User,
  Calendar,
  Plus
} from 'lucide-react';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AvailableDoctors = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch available doctors
  const { data: doctorsData, isLoading, refetch } = useQuery(
    'availableDoctors',
    () => axios.get('/doctors/available').then(res => res.data),
    { refetchInterval: 30000 }
  );

  const doctors = doctorsData || [];

  // Get unique specializations and languages
  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];
  const languages = [...new Set(doctors.map(d => d.language).filter(Boolean))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 doctor.specialization === selectedSpecialization;
    
    const matchesLanguage = selectedLanguage === 'all' || 
                           doctor.language === selectedLanguage;
    
    return matchesSearch && matchesSpecialization && matchesLanguage;
  });

  const handleBookConsultation = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleCallDoctor = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleStartChat = (doctorId) => {
    // Navigate to chat or create consultation
    toast.info('Chat feature coming soon!');
  };

  const handleVideoCall = (doctorId) => {
    // Implement video call functionality
    toast.info('Video call feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Available Doctors</h1>
          <p className="text-gray-600 mt-1">
            Connect with qualified healthcare professionals for consultations
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </motion.div>

      {/* Doctors Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor, index) => (
            <motion.div
              key={doctor._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {doctor.rating || 0}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {doctor.totalConsultations || 0} consultations
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {doctor.experience && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                )}
                
                {doctor.language && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Speaks {doctor.language}</span>
                  </div>
                )}

                {doctor.consultationFee && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium text-green-600">
                      ₦{doctor.consultationFee.toLocaleString()}
                    </span>
                    <span>per consultation</span>
                  </div>
                )}
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBookConsultation(doctor)}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book</span>
                </button>
                
                <button
                  onClick={() => handleCallDoctor(doctor.phone)}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                  title="Call Doctor"
                >
                  <Phone className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleStartChat(doctor._id)}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                  title="Start Chat"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleVideoCall(doctor._id)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  title="Video Call"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedSpecialization !== 'all' || selectedLanguage !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No doctors are currently available'
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            toast.success('Consultation booked successfully!');
          }}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('chat');
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const consultationData = {
        doctorId: doctor._id,
        scheduledAt: new Date(`${selectedDate}T${selectedTime}`),
        type: consultationType,
        symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean)
      };

      await axios.post('/consultations', consultationData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book consultation');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Book Consultation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-6 w-6 transform rotate-45" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Dr. {doctor.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialization}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Type
            </label>
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="chat">Chat Consultation</option>
              <option value="video">Video Consultation</option>
              <option value="voice">Voice Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select time</option>
              {getAvailableTimes().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms (optional)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedDate || !selectedTime}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Booking...' : 'Book Consultation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AvailableDoctors; 