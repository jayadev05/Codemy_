const Message = require("../model/messageModel");
const Chat = require("../model/chatModel");

const videoCallHandler = (io, socket, onlineStudents, onlineTutors) => {
    
  const findReceiverSocket = (receiverId) => {
    const receiver = onlineTutors[receiverId] || onlineStudents[receiverId];
    return receiver?.socketId;
};

socket.on("initiate-call", async (data) => {
    try {
        const {
            recieverId,
            signalData,
            from,
            callerName,
            callerAvatar,
            callerUserId,
        } = data;

        const receiverSocketId = findReceiverSocket(recieverId);
        
        if (!receiverSocketId) {
            // Emit back to caller if receiver not found
            socket.emit("call-failed", { reason: "User offline" });
            return;
        }

        io.to(receiverSocketId).emit("incoming-call", {
          from,
          callerData: {
              name: callerName,
              avatar: callerAvatar,
              userId: callerUserId,
          },
          signalData,
      }, (error) => {
          if (error) {
              console.error('Failed to deliver call to receiver:', error);
              io.to(from).emit("call-failed", { reason: "Delivery failed" });
          }
      });

       

    } catch (error) {
        console.error("Error in initiate-call:", error);
        socket.emit("call-failed", { reason: error.message });
    }
});

    socket.on("answer-call", ({ signalData, to }) => {

      console.log("Answer call data:", signalData , "to:",to);

      const callerSocketId = findReceiverSocket(to);

      console.log(Object.values(onlineStudents),Object.values(onlineTutors));
     
      
        io.to(callerSocketId).emit("call-accepted", { signalData });
      
    });
  
    socket.on("call-rejected", ({ to }) => {
      console.log("call rejected event trigerred",to);
      const callerSocketId = findReceiverSocket(to);
     
        io.to(callerSocketId).emit("call-rejected");
      
      
    });

    socket.on("call-ended", ({ to }) => {

      console.log("call ended event trigerred");

      

      const receiverSocketId = findReceiverSocket(to);

      
        io.to(receiverSocketId).emit("call-ended");
      

      
    });


  };
module.exports = { videoCallHandler };
