import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user's personal room
        newSocket.emit('joinUserRoom', { userId: user._id });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinConsultationRoom = (consultationId) => {
    if (socket && isConnected) {
      socket.emit('joinConsultationRoom', { consultationId });
    }
  };

  const leaveConsultationRoom = (consultationId) => {
    if (socket && isConnected) {
      socket.emit('leaveConsultationRoom', { consultationId });
    }
  };

  const sendMessage = (consultationId, message) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { consultationId, message });
    }
  };

  const sendTypingStatus = (consultationId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', { 
        consultationId, 
        isTyping, 
        userId: user._id, 
        userName: user.name 
      });
    }
  };

  // Call functions
  const initiateCall = (consultationId, callType) => {
    if (socket && isConnected) {
      socket.emit('callRequest', { consultationId, callType });
    }
  };

  const acceptCall = (consultationId, callType) => {
    if (socket && isConnected) {
      socket.emit('callAccepted', { consultationId, callType });
    }
  };

  const rejectCall = (consultationId) => {
    if (socket && isConnected) {
      socket.emit('callRejected', { consultationId });
    }
  };

  const endCall = (consultationId) => {
    if (socket && isConnected) {
      socket.emit('callEnded', { consultationId });
    }
  };

  const sendIceCandidate = (consultationId, candidate) => {
    if (socket && isConnected) {
      socket.emit('iceCandidate', { consultationId, candidate });
    }
  };

  const sendOffer = (consultationId, offer) => {
    if (socket && isConnected) {
      socket.emit('offer', { consultationId, offer });
    }
  };

  const sendAnswer = (consultationId, answer) => {
    if (socket && isConnected) {
      socket.emit('answer', { consultationId, answer });
    }
  };

  const value = {
    socket,
    isConnected,
    joinConsultationRoom,
    leaveConsultationRoom,
    sendMessage,
    sendTypingStatus,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    sendIceCandidate,
    sendOffer,
    sendAnswer
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};