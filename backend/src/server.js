import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { setupSockets } from './socket/socketHandler.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';

// Load Env variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Socket.IO with standard CORS allowed origins
const io = new Server(server, {
  cors: {
    origin: '*', // Allows convenient local client connections
    methods: ['GET', 'POST', 'PUT']
  }
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Request Logging
app.use((req, res, next) => {
  console.log(`📡 [Express] ${req.method} request received for: ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Define compiled static assets path
const distPath = path.resolve(__dirname, '../../frontend/dist');

// Serve compiled static assets from the React dist folder if in production or build folder exists
if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('📦 [Server] Production static file serving enabled automatically.');
} else {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date() });
  });
}



// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 [Server Error]:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error occurred' });
});

// Setup Sockets
setupSockets(io);

// Connect Database & Boot Server
const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`\n🚀 ===============================================`);
    console.log(`☕ [Mochill Server] active on port ${PORT}`);
    console.log(`✨ Mode: MERN Environment (Node + Express)`);
    console.log(`🔌 Real-Time Sockets: Setup completed`);
    console.log(`🚀 ===============================================\n`);
  });
};

startServer();
