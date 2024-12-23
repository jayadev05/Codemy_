const Message= require('../model/messageModel');
const Chat=require('../model/chatModel');

const chatHandler =(io, socket, onlineStudents, onlineTutors)=>{

  const onlineUsers = { ...onlineTutors, ...onlineStudents };


  //send message event
  socket.on('send-message', async (data) => {
    const { chatId, messageId, sender, receiver, content, timestamps } = data;
    console.log('Timestamps:', timestamps);

  
    console.log('Send message event triggered:', data);
    
    try {
      const chat = await Chat.findOne({ _id: chatId });
      if (!chat) {
        console.log('Chat not found for chatId:', chatId);
        socket.emit('error', { message: "Chat not found" });
        return;
      }
  
      console.log('Receiver Info:', receiver);
      console.log('Online Students:', onlineStudents);
      console.log('Online Tutors:', onlineTutors);
  
      // Check both mappings for the receiver
      const receiverSocketId =
        onlineTutors[receiver.userId]?.socketId || 
        onlineStudents[receiver.userId]?.socketId;
  
      console.log('Resolved Receiver Socket ID:', receiverSocketId);
  
      if (!receiverSocketId) {
        console.log('Receiver is offline or not found:', receiver.userId);
        socket.emit('message-delivery-status', { status: 'offline', receiverId: receiver.userId });
        return;
      }
  
      io.to(receiverSocketId).emit('receive-message', {
        messageId,
        sender,
        receiver,
        chatId,
        content,
        timestamps,
        chatData: chat
      });
  
      console.log('Message sent to receiver:', receiverSocketId);
    } catch (error) {
      console.error("Error in send-message:", error);
      socket.emit('error', { message: "Failed to process message" });
    }
  });
  
  


  //typing event indicator event
  socket.on('typing', (data) => {
    const { chatId, senderId, receiverId } = data;
    const receiverOnline = onlineUsers[receiverId];
    
    if (receiverOnline) {
      io.to(receiverOnline.socketId).emit('typing', {
        chatId,
        senderId
      });
    }
  });

//stopped typing indicator event 

socket.on('stop-typing', (data) => {
  const { chatId, senderId, receiverId } = data;
  const receiverOnline = onlineUsers[receiverId];
  
  if (receiverOnline) {
    io.to(receiverOnline.socketId).emit('stop-typing', {
      chatId,
      senderId
    });
  }
});


}

module.exports={chatHandler};