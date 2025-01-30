const Message= require('../model/messageModel');
const Chat=require('../model/chatModel');

const chatHandler =(io, socket, onlineStudents, onlineTutors)=>{

  const onlineUsers = { ...onlineTutors, ...onlineStudents };


  //send message event
  socket.on('send-message', async (data) => {
    const { chatId, _id, sender, receiver, content, contentType, timestamps } = data;
    
    try {
      const chat = await Chat.findOne({ _id: chatId });
      if (!chat) {
        console.log('Chat not found for chatId:', chatId);
        socket.emit('error', { message: "Chat not found" });
        return;
      }
  
      // Check both mappings for the receiver
      const receiverSocketId = 
        onlineTutors[receiver.userId]?.socketId || 
        onlineStudents[receiver.userId]?.socketId;
  
      // If receiver is online, mark as delivered
      if (receiverSocketId) {
        // Update message status
        await Message.findByIdAndUpdate(_id, { status: 'delivered' });
  
        // Emit to receiver
        io.to(receiverSocketId).emit('receive-message', {
          _id,
          sender,
          receiver,
          chatId,
          content,
          contentType,
          timestamps,
          chatData: chat,
          status: 'delivered'
        });
  
        // Notify sender about delivery
        io.to(socket.id).emit('message-delivered', {
          chatId,
          messageIds: [_id]
        });
      } else {
        // Receiver offline - just send the message (status will be 'sent' by default)
        io.to(receiverSocketId).emit('receive-message', {
          _id,
          sender,
          receiver,
          chatId,
          content,
          contentType,
          timestamps,
          chatData: chat
        });
      }
  
    } catch (error) {
      console.error("Error in send-message:", error);
      socket.emit('error', { message: "Failed to process message" });
    }
  });

  socket.on('join', (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log('User', socket.id, 'joined room:', roomId);
    } else {
      console.log('No room ID provided for join');
    }
  });

  //typing event indicator event
  socket.on('typing', async (data) => {
    const { chatId, senderId, receiverId } = data;
    console.log('Typing event received:', data);

    // Check both student and tutor online mappings
    const receiverSocketId = 
      onlineTutors[receiverId]?.socketId || 
      onlineStudents[receiverId]?.socketId;

    if (receiverSocketId) {
      console.log('Emitting typing event to:', receiverSocketId);
      io.to(receiverSocketId).emit('typing', {
        chatId,
        senderId,
        receiverId
      });
    }
  });

  //stopped typng indicator event
  socket.on('stop-typing', async (data) => {
    const { chatId, senderId, receiverId } = data;
    console.log('Stop typing event received:', data);

    const receiverSocketId = 
      onlineTutors[receiverId]?.socketId || 
      onlineStudents[receiverId]?.socketId;

    if (receiverSocketId) {
      console.log('Emitting stop typing event to:', receiverSocketId);
      io.to(receiverSocketId).emit('stop-typing', {
        chatId,
        senderId,
        receiverId
      });
    }
  });


  // Handle message read status
  socket.on('message-read', async (data) => {
    console.log("message read socket on", data);
    const { chatId, userId, userType } = data;
  
    try {
      // Update all unread messages for the given chat and user
      const messages = await Message.updateMany(
        {
          chatId,
          'receiver.userId': userId,
          status: { $ne: 'read' },
        },
        { status: 'read' }
      );

      console.log("messages",messages);
  
      // Find the updated message IDs
      const updatedMessages = await Message.find({
        chatId,
        'receiver.userId': userId,
        status: 'read',
      }).select('_id'); 

      console.log("Updated Messages",updatedMessages);
  
      const updatedMessageIds = updatedMessages.map((msg) => msg._id.toString());

      console.log('Updated Message IDs:', updatedMessageIds); 

  
      // Update unread count in the chat document
      const chat = await Chat.findById(chatId);
      if (!chat) return;
  
      if (userType === 'user') {
        chat.unreadCount.student = 0;
      } else if (userType === 'tutor') {
        chat.unreadCount.tutor = 0;
      }
  
      await chat.save();
  
      const otherUserId =
        userType === 'user' ? chat.tutorId : chat.userId;
      const receiverSocketId =
        onlineTutors[otherUserId]?.socketId ||
        onlineStudents[otherUserId]?.socketId;
  
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message-read', {
          chatId,
          userType,
          unreadCount: chat.unreadCount,
          messageIds:updatedMessageIds
        });
      }
    } catch (error) {
      console.error('Error in message-read:', error);
    }
  });
  





}

module.exports={chatHandler};