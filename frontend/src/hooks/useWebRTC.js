import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useWebRTC = (roomId, activeUsers, currentUserId) => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [voiceUsers, setVoiceUsers] = useState({}); // { [userId]: { isMuted, volume } }
  
  const peers = useRef({}); // { [socketId]: RTCPeerConnection }
  const audioElements = useRef({}); // { [socketId]: HTMLAudioElement }
  const localStreamRef = useRef(null);

  // Initialize Mic stream
  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      localStreamRef.current = stream;
      console.log('🎤 [WebRTC] Microphone stream successfully captured.');
      return stream;
    } catch (err) {
      console.warn('⚠️ [WebRTC] Microphone permissions denied or unavailable. Running in audio-receive mode only.');
      return null;
    }
  };

  const cleanUpPeer = (peerSocketId) => {
    if (peers.current[peerSocketId]) {
      peers.current[peerSocketId].close();
      delete peers.current[peerSocketId];
    }
    if (audioElements.current[peerSocketId]) {
      audioElements.current[peerSocketId].remove();
      delete audioElements.current[peerSocketId];
    }
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen to signaling events
    socket.on('webrtc:signal', async ({ senderSocketId, signalData }) => {
      try {
        let pc = peers.current[senderSocketId];

        if (!pc) {
          // Create a peer connection on demand
          pc = createPeerConnection(senderSocketId);
        }

        if (signalData.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.sdp));
          if (signalData.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc:signal', {
              targetSocketId: senderSocketId,
              signalData: { sdp: pc.localDescription }
            });
          }
        } else if (signalData.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        }
      } catch (err) {
        console.error('💥 [WebRTC Signal Error]:', err.message);
      }
    });

    socket.on('avatar:left', ({ socketId }) => {
      cleanUpPeer(socketId);
    });

    return () => {
      socket.off('webrtc:signal');
      socket.off('avatar:left');
      
      // Stop mic stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close all peers
      Object.keys(peers.current).forEach(cleanUpPeer);
    };
  }, [socket, roomId]);

  // Create Peer Connection helper
  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peers.current[targetSocketId] = pc;

    // Push local mic tracks to peer
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:signal', {
          targetSocketId,
          signalData: { candidate: event.candidate }
        });
      }
    };

    // Receive Remote Audio stream
    pc.ontrack = (event) => {
      console.log(`🔊 [WebRTC] Received audio track from peer: ${targetSocketId}`);
      const remoteStream = event.streams[0];
      
      // Build an audio element dynamically
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.volume = 0.5; // Starts at half volume
      
      audioElements.current[targetSocketId] = audio;
      document.body.appendChild(audio); // Mount audio to DOM

      // Explicitly invoke play with gesture catch to bypass browser autoplay blocks
      audio.play().catch(err => {
        console.warn('🔇 [WebRTC Audio] Autoplay blocked. User canvas interaction will trigger play shortly.', err.message);
      });
    };

    return pc;
  };

  // Perform handshakes when avatars walk near each other (Proximity trigger)
  const initiateHandshake = async (targetSocketId) => {
    if (peers.current[targetSocketId]) return; // Already connected
    
    console.log(`🤝 [WebRTC] Initiating spatial voice handshake with socket: ${targetSocketId}`);
    const pc = createPeerConnection(targetSocketId);
    
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socket.emit('webrtc:signal', {
        targetSocketId,
        signalData: { sdp: pc.localDescription }
      });
    } catch (err) {
      console.error('💥 [WebRTC Handshake Error]:', err.message);
    }
  };

  return {
    initLocalStream,
    localStream,
    initiateHandshake,
    audioElements: audioElements.current
  };
};
