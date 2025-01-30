const { Server } = require('socket.io');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Chat = require('../model/chatModel');
const Message=require('../model/messageModel')
const { chatHandler } = require("./chatHandler");
const { videoCallHandler } = require('./videoCallHandler');

let onlineTutors = {};
let onlineStudents = {};
let ioInstance;

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],  
      credentials: true,
    },
    pingTimeout: 60000,      
    pingInterval: 25000,       
    connectTimeout: 60000,      // Increased to 1 minute
  });

  ioInstance = io;

  // authenticate user
  io.use(async (socket, next) => {
    const auth = socket.handshake.auth;
    const headers = socket.handshake.headers;
  
    // Extract tokens
    const accessToken = auth.token || headers.authorization?.replace("Bearer ", "");
    const refreshToken = auth.refreshToken;
  
    
  
    if (!accessToken && !refreshToken) {
      return next(new Error("Authentication tokens missing"));
    }
  
    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      socket.user = { userId: decoded.id, userType: decoded.type };
      return next();
    } catch (error) {
      // Handle token expiration
      if (error.name === "TokenExpiredError" && refreshToken) {
        try {
          // Verify refresh token
          const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  
          // Generate a new access token
          const newAccessToken = jwt.sign(
            { id: decodedRefresh.id, type: decodedRefresh.type },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
          );
  
          // Attach new token to socket response
          socket.emit("new-access-token", { token: newAccessToken });
  
          // Update user data
          socket.user = { userId: decodedRefresh.id, userType: decodedRefresh.type };
  
          return next();
        } catch (refreshError) {
          console.error("Refresh token verification failed:", refreshError);
          return next(new Error("Invalid or expired refresh token"));
        }
      }
  
      console.error("Access token verification failed:", error);
      return next(new Error("Authentication failed"));
    }
  });


  // establish connected users
  io.on('connection', async (socket) => {
    console.log('New client connected', socket.id);
    
    const { userId, userType } = socket.user;
    
    try {
      // Update online status in chats
      const updateQuery = userType === 'tutor' 
        ? { tutorId: userId }
        : { userId };
      
      const updateField = userType === 'tutor'
        ? "isOnline.tutor"
        : "isOnline.student";
      
      await Chat.updateMany(
        updateQuery,
        { $set: { [updateField]: true } }
      );
  
      // Store socket info
      if (userType === 'tutor') {
        onlineTutors[userId] = { socketId: socket.id, userId };
      } else {
        onlineStudents[userId] = { socketId: socket.id, userId };
      }
  
      // Handle undelivered messages when user comes online
      const undeliveredMessages = await Message.find({
        'receiver.userId': userId,
        status: 'sent'
      }).select('_id chatId');
  
      if (undeliveredMessages.length > 0) {
        // Group messages by chatId
        const messagesByChatId = undeliveredMessages.reduce((acc, msg) => {
          if (!acc[msg.chatId]) {
            acc[msg.chatId] = [];
          }
          acc[msg.chatId].push(msg._id);
          return acc;
        }, {});
  
        // Update all messages to delivered
        await Message.updateMany(
          {
            'receiver.userId': userId,
            status: 'sent'
          },
          { status: 'delivered' }
        );
  
        // Notify senders for each chat
        for (const [chatId, messageIds] of Object.entries(messagesByChatId)) {
          const chat = await Chat.findById(chatId);
          const senderId = userType === 'user' ? chat.tutorId : chat.userId;
          
          // Get sender's socket if they're online
          const senderSocketId = userType === 'user' 
            ? onlineTutors[senderId]?.socketId 
            : onlineStudents[senderId]?.socketId;
  
          if (senderSocketId) {
            io.to(senderSocketId).emit('message-delivered', {
              chatId,
              userType,
              messageIds
            });
          }
        }
      }
  
      // Broadcast status update
      socket.broadcast.emit('user-status-update');
  
      // Initialize chat handler
      chatHandler(io, socket, onlineTutors, onlineStudents);

      // Initialize video call handler
      videoCallHandler(io, socket, onlineTutors, onlineStudents);


  
      socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`User ${roomId} joined their room`);
      });
  
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

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
};

module.exports = { initializeSocket ,getIO};
