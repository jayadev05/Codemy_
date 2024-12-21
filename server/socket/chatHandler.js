const Message= require('../model/messageModel');
const Chat=require('../model/chatModel');

const chatHandler =(io, socket, onlineStudents, onlineTutors)=>{

  const onlineUsers = { ...onlineTutors, ...onlineStudents };


  //send message event
  socket.on('send-message',async(data)=>{

    const{
      chatId,
      messageId,
      sender,
      receiver,
      content,
      timestamps
    } = data;

    const senderId = sender.userId;
    const receiverId = receiver.userId;

    console.log("data",data);

    try {
      
      const chat = await Chat.findOne({_id:chatId});

      if(!chat){
        console.log("Chat not found");
        return (new Error("Chat not found"));
      }

      await Message.create({
        chatId,
        messageId,
        sender,
        receiver,
        content
      });

      //atomcially update chat

      await Chat.findByIdAndUpdate(
        chatId,
        {
          $set: {
            'lastMessage.content': content,
            'lastMessage.senderId': senderId,
            'lastMessage.timestamp': new Date()
          },
          $inc: {
            [`unreadCount.${socket.user.userType === 'user' ? 'student' : 'tutor'}`]: 1
          }
        },
        { new: true }
      );

      const receiverOnline = socket.user.userType==='tutor' ? onlineTutors[receiverId] : onlineStudents[receiverId]

      if(receiverOnline){
        io.to(receiverOnline.socketId).emit('recieve-message',{
          messageId,
          senderId,
          chatId,
          content,
          timestamps,
          chatData:chat
        });
      }

      else {
        console.log("Receiver is not online")
      }

    } catch (error) {
        console.log("Error saving message",error);
    } 



  })

  //typing event indicator event
  socket.on('typing',(data)=>{
    const {receiverId} = data;

    if(onlineUsers[receiverId]){
      io.to(onlineUsers[receiverId].socketId).emit('typing',{
        senderId:socket.user.userId
      })
    }
});


//stopped typing indicator event 

socket.on('stop-typing',(data)=>{

  const {receiverId}=data;

  if(onlineUsers[receiverId]){
    io.to(onlineUsers[receiverId].socketId).emit('stop-typing',{
      senderId:socket.user.userId
    })
  }

})

}

module.exports={chatHandler};