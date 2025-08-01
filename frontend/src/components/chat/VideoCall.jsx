import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VideoCall = ({ consultationId, onClose }) => {
  const { user } = useAuth();
  const { 
    socket, 
    initiateCall, 
    acceptCall, 
    rejectCall, 
    endCall,
    sendIceCandidate,
    sendOffer,
    sendAnswer
  } = useSocket();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [incomingCallData, setIncomingCallData] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (socket) {
      // Handle incoming calls
      socket.on('incomingCall', (data) => {
        if (data.consultationId === consultationId) {
          setIncomingCallData(data);
          setIsIncomingCall(true);
        }
      });

      // Handle call accepted
      socket.on('callAccepted', (data) => {
        if (data.consultationId === consultationId) {
          setIsCallActive(true);
          setIsIncomingCall(false);
          if (data.callType === 'video') {
            startVideoCall();
          } else {
            startAudioCall();
          }
        }
      });

      // Handle call rejected
      socket.on('callRejected', (data) => {
        if (data.consultationId === consultationId) {
          setIsIncomingCall(false);
          toast.error('Call was rejected');
        }
      });

      // Handle call ended
      socket.on('callEnded', (data) => {
        if (data.consultationId === consultationId) {
          endCurrentCall();
        }
      });

      // Handle WebRTC events
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('iceCandidate', handleIceCandidate);

      return () => {
        socket.off('incomingCall');
        socket.off('callAccepted');
        socket.off('callRejected');
        socket.off('callEnded');
        socket.off('offer');
        socket.off('answer');
        socket.off('iceCandidate');
      };
    }
  }, [socket, consultationId]);

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await initializePeerConnection();
      setCallType('video');
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  const startAudioCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });
      
      localStreamRef.current = stream;
      await initializePeerConnection();
      setCallType('audio');
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting audio call:', error);
      toast.error('Failed to start audio call');
    }
  };

  const initializePeerConnection = async () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(consultationId, event.candidate);
      }
    };
  };

  const handleOffer = async (data) => {
    if (data.consultationId === consultationId) {
      await initializePeerConnection();
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      sendAnswer(consultationId, answer);
    }
  };

  const handleAnswer = async (data) => {
    if (data.consultationId === consultationId) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    if (data.consultationId === consultationId) {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleIncomingCall = async (accepted) => {
    if (accepted) {
      if (incomingCallData.callType === 'video') {
        await startVideoCall();
      } else {
        await startAudioCall();
      }
      acceptCall(consultationId, incomingCallData.callType);
    } else {
      rejectCall(consultationId);
    }
    setIsIncomingCall(false);
  };

  const endCurrentCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsCallActive(false);
    endCall(consultationId);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const initiateVideoCall = () => {
    initiateCall(consultationId, 'video');
    startVideoCall();
  };

  const initiateAudioCall = () => {
    initiateCall(consultationId, 'audio');
    startAudioCall();
  };

  if (isIncomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {incomingCallData?.callType === 'video' ? (
                <Video className="h-8 w-8 text-blue-600" />
              ) : (
                <Phone className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">Incoming {incomingCallData?.callType} call</h3>
            <p className="text-gray-600 mb-4">from {incomingCallData?.caller?.name}</p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => handleIncomingCall(false)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={() => handleIncomingCall(true)}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCallActive) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="relative w-full h-full">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local video */}
          <div className="absolute top-4 right-4 w-48 h-36">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          {/* Call controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-600' : 'bg-red-500'}`}
            >
              {isAudioEnabled ? (
                <Mic className="h-6 w-6 text-white" />
              ) : (
                <MicOff className="h-6 w-6 text-white" />
              )}
            </button>
            
            {callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-600' : 'bg-red-500'}`}
              >
                {isVideoEnabled ? (
                  <Video className="h-6 w-6 text-white" />
                ) : (
                  <VideoOff className="h-6 w-6 text-white" />
                )}
              </button>
            )}
            
            <button
              onClick={endCurrentCall}
              className="p-4 rounded-full bg-red-500"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Start a call</h3>
          
          <div className="flex space-x-4">
            <button
              onClick={initiateAudioCall}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Audio</span>
            </button>
            
            <button
              onClick={initiateVideoCall}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center space-x-2"
            >
              <Video className="h-5 w-5" />
              <span>Video</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall; 