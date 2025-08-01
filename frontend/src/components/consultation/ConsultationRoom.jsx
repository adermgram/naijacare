import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  MoreVertical,
  ArrowLeft,
  User,
  Clock,
  FileText,
  Settings,
  Volume2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ConsultationRoom = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState('connecting');

  // Fetch consultation details
  const { data: consultation, isLoading } = useQuery(
    ['consultation', consultationId],
    () => axios.get(`/consultations/${consultationId}`).then(res => res.data),
    { enabled: !!consultationId }
  );

  // Update consultation status mutation
  const updateStatusMutation = useMutation(
    (status) => axios.put(`/consultations/${consultationId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['consultation', consultationId]);
      }
    }
  );

  const otherUser = consultation?.patientId?._id === user?._id 
    ? consultation?.doctorId 
    : consultation?.patientId;

  useEffect(() => {
    if (consultation) {
      setConsultationStatus(consultation.status);
    }
  }, [consultation]);

  const handleStartConsultation = () => {
    updateStatusMutation.mutate('in-progress');
    setConsultationStatus('in-progress');
    toast.success('Consultation started');
  };

  const handleEndConsultation = () => {
    updateStatusMutation.mutate('completed');
    setConsultationStatus('completed');
    toast.success('Consultation ended');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.info(`Video ${!isVideoEnabled ? 'enabled' : 'disabled'}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(`Microphone ${!isMuted ? 'muted' : 'unmuted'}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Consultation not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold">
              {consultation.type === 'video' ? 'Video' : 'Voice'} Consultation
            </h1>
            <p className="text-gray-400 text-sm">
              {otherUser?.name} • {consultation.type}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">00:00</span>
          </div>
          
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video/Audio Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            {consultation.type === 'video' ? (
              <div className="text-center">
                <div className="h-32 w-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-400">Video call connecting...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {isVideoEnabled ? 'Camera is on' : 'Camera is off'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-32 w-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-16 w-16 text-white" />
                </div>
                <p className="text-white text-lg font-semibold">Voice Call</p>
                <p className="text-gray-400 mt-2">
                  {isAudioEnabled ? 'Audio is enabled' : 'Audio is disabled'}
                </p>
              </div>
            )}
          </div>

          {/* Local Video (if video consultation) */}
          {consultation.type === 'video' && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 320 }}
            className="bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Chat</h3>
            </div>
            <div className="flex-1 p-4">
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chat feature coming soon!</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Controls */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Video Controls (only for video consultations) */}
          {consultation.type === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoEnabled ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          )}

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full transition-colors ${
              showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* Main Action Button */}
          {consultationStatus === 'scheduled' ? (
            <button
              onClick={handleStartConsultation}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Start Consultation</span>
            </button>
          ) : consultationStatus === 'in-progress' ? (
            <button
              onClick={handleEndConsultation}
              className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <PhoneOff className="h-5 w-5" />
              <span>End Consultation</span>
            </button>
          ) : (
            <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-full">
              Consultation {consultationStatus}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreVertical className="h-5 w-5 transform rotate-90" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Microphone</span>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              
              {consultation.type === 'video' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Camera</span>
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded ${!isVideoEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Speaker</span>
                <button className="p-2 rounded bg-gray-100 text-gray-600">
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom; 