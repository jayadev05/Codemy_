const { Server } = require('socket.io');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Chat = require('../model/chatModel');
const { chatHandler } = require("./chatHandler");

let onlineTutors = {};
let onlineStudents = {};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],  // Added Content-Type
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // authenticate user
  io.use((socket, next) => {
    const auth = socket.handshake.auth;
    
    // Better error handling for missing token
    if (!auth || (!auth.token && !socket.handshake.headers.authorization)) {
      return next(new Error("Authentication token missing"));
    }

    // Try to get token from either auth object or Authorization header
    const token = auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (!decoded.id || !decoded.type) {
        console.error('Invalid token structure:', decoded);
        return next(new Error("Invalid token structure"));
      }

      // Attach user info to socket
      socket.user = {
        userId: decoded.id,
        userType: decoded.type
      };


      next();

    } catch (error) {
      console.error('Token verification failed:', {
        errorName: error.name,
        errorMessage: error.message,
        token: token?.substring(0, 10) + '...'
      });

      if (error.name === 'TokenExpiredError') {
        socket.emit('token-expired', { 
          message: "Session expired. Please log in again.",
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return next(new Error(`Invalid token: ${error.message}`));
      } else {
        return next(new Error("Authentication failed"));
      }
    }
  });


  // establish connected users
  io.on('connection', async (socket) => {
    console.log('New client connected');
    const { userId, userType } = socket.user;

    try {
      if (userType === 'tutor') {
        onlineTutors[userId] = { socketId: socket.id, userId };
        await Chat.updateMany(
          { tutorId: userId },
          { $set: { "isOnline.tutor": true } }
        );
      } else if (userType === 'user') {
        onlineStudents[userId] = { socketId: socket.id, userId };
        await Chat.updateMany(
          { userId },
          { $set: { "isOnline.student": true } }
        );
      }

      socket.broadcast.emit('user-status-update');

      // Initialize chat handler for this socket
      chatHandler(io, socket, onlineTutors, onlineStudents);

      // Handle disconnect
      socket.on('disconnect', async () => {
        const { userId, userType } = socket.user || {};

        try {
          if (!userId) return;

          if (userType === 'tutor') {
            await Chat.updateMany(
              { tutorId: userId },
              { $set: { "isOnline.tutor": false } }
            );
            delete onlineTutors[userId];
          } else if (userType === 'user') {
            await Chat.updateMany(
              { userId },
              { $set: { "isOnline.student": false } }
            );
            delete onlineStudents[userId];
          }

          socket.broadcast.emit('user-status-update');
        } catch (error) {
          console.error("Error in disconnect handler:", error);
        }
      });
    } catch (error) {
      console.error("Error in connection handler:", error);
      socket.emit('error', {
        type: 'CONNECTION_ERROR',
        message: 'Failed to establish connection'
      });
    }
  });

  return io;
  
};

module.exports = { initializeSocket };