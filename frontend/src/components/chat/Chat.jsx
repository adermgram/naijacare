import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  User,
  Clock,
  FileText,
  Camera,
  Paperclip,
  MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import VideoCall from './VideoCall';

const Chat = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected, joinConsultationRoom, leaveConsultationRoom, sendMessage } = useSocket();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  // Fetch consultation details
  const { data: consultation, isLoading: consultationLoading } = useQuery(
    ['consultation', consultationId],
    () => axios.get(`/consultations/${consultationId}`).then(res => res.data),
    { enabled: !!consultationId }
  );

  // Fetch chat messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', consultationId],
    () => axios.get(`/chat/${consultationId}`).then(res => res.data),
    { 
      enabled: !!consultationId,
      refetchInterval: 5000 // Refetch every 5 seconds
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => axios.post('/chat', messageData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', consultationId]);
      },
      onError: () => {
        toast.error('Failed to send message');
      }
    }
  );

  const messages = messagesData || [];
  const otherUser = consultation?.patientId?._id === user?._id 
    ? consultation?.doctorId 
    : consultation?.patientId;

  useEffect(() => {
    if (consultationId && isConnected) {
      joinConsultationRoom(consultationId);
    }

    return () => {
      if (consultationId) {
        leaveConsultationRoom(consultationId);
      }
    };
  }, [consultationId, isConnected]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (data) => {
        if (data.consultationId === consultationId) {
          queryClient.invalidateQueries(['messages', consultationId]);
        }
      });

      socket.on('userTyping', (data) => {
        if (data.consultationId === consultationId) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== data.userId);
            if (data.isTyping) {
              return [...filtered, { userId: data.userId, name: data.userName }];
            }
            return filtered;
          });
        }
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('userTyping');
      };
    }
  }, [socket, consultationId, queryClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      consultationId,
      content: message.trim(),
      type: 'text'
    };

    try {
      await sendMessageMutation.mutateAsync(messageData);
      setMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { consultationId, isTyping: true, userId: user._id, userName: user.name });
    }

    // Clear typing indicator after 2 seconds of no typing
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { consultationId, isTyping: false, userId: user._id, userName: user.name });
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const startVoiceCall = () => {
    setShowVideoCall(true);
  };

  if (consultationLoading) {
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherUser?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {otherUser?.specialization || 'Patient'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            
            <button
              onClick={startVoiceCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={startVideoCall}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Video className="h-5 w-5 text-gray-600" />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => (
            <motion.div
              key={msg._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === user._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderId === user._id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 px-4 py-2 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm ml-2">
                  {typingUsers.map(u => u.name).join(', ')} typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-t border-gray-200 p-4"
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                onClick={() => setShowAttachments(!showAttachments)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Paperclip className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Camera className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessageMutation.isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Attachment menu */}
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Document</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span>Photo</span>
              </button>
            </div>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
      </motion.div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCall 
          consultationId={consultationId} 
          onClose={() => setShowVideoCall(false)} 
        />
      )}
    </div>
  );
};

export default Chat; 