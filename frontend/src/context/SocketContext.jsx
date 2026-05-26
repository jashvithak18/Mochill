import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Only connect if user is authenticated and has token
    if (isAuthenticated && token) {
      const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
      
      console.log(`🔌 [SocketProvider] Initializing Socket connection to ${socketUrl}...`);
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        auth: { token }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log(`🔌 [SocketProvider] Connected with ID: ${newSocket.id}`);
      });

      newSocket.on('connect_error', (err) => {
        console.error('⚠️ [SocketProvider] Connection error:', err.message);
      });

      return () => {
        console.log('🔌 [SocketProvider] Disconnecting Socket...');
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
