const Message = require("../model/messageModel");
const Chat = require("../model/chatModel");

const videoCallHandler = (io, socket, onlineStudents, onlineTutors) => {
    
    socket.on("initiate-call", async ({
      signalData,
      recieverId,
      from,
      callerName,
      callerAvatar,
      callerUserId,
    }) => {
      console.log('Incoming call signal data:', signalData);
      
      const receiver = onlineTutors[recieverId] || onlineStudents[recieverId];
      console.log('Receiver socket ID:', receiver?.socketId);
      
      if (receiver) {
        io.to(receiver.socketId).emit("incoming-call", {
          from,
          callerData: {
            name: callerName,
            avatar: callerAvatar,
            userId: callerUserId,
          },
          signalData,
        });
      }
    });
  
    socket.on("answer-call", ({ signalData, to }) => {
      console.log("Answer call data:", signalData);
      const receiver = Object.values(onlineTutors).find(user => user.socketId === to) ||  Object.values(onlineStudents).find(user => user.socketId === to);

      console.log(Object.values(onlineStudents),Object.values(onlineTutors));
      console.log('Receiver:', receiver);
      
      if (receiver) {
        io.to(to).emit("call-accepted", { signalData });
      }
    });
  
    socket.on("end-call", ({ to }) => {
      io.to(to).emit("call-ended");
    });
  };
module.exports = { videoCallHandler };
