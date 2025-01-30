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

      console.log(signalData);

      const receiverSocketId = findReceiverSocket(recieverId);

      if (!receiverSocketId) {
        socket.to(callerUserId).emit("call-failed", { reason: "User offline" });
        return;
      }

     
      io.to(recieverId).emit(
        "incoming-call",
        {
          from,
          callerData: {
            name: callerName,
            avatar: callerAvatar,
            userId: callerUserId,
          },
          signalData,
        },
        (err) => {
          if (err) {
            console.error("Failed to deliver call to receiver:", err);
            socket.to(callerUserId).emit("call-failed", {
              reason: "Delivery failed",
            });
          }
        }

        
      );

      console.log("Emitted incoming call to reciever");
      
    } catch (error) {
      console.error("Error in initiate-call:", error);
      socket.emit("call-failed", {
        reason: "Internal server error",
        error: error.message,
      });
    }
  });

  socket.on("answer-call", async (data) => {
    try {
      const { signalData, to } = data;

      console.log(to, "to in answer call");
      console.log(signalData);

      socket.to(to).emit("call-accepted", { signalData }, (err) => {
        if (err) {
          console.error("Failed to deliver call answer:", err);
        }
      });
    } catch (error) {
      console.error("Error in answer-call:", error);
      socket.emit("call-failed", {
        reason: "Failed to answer call",
        error: error.message,
      });
    }
  });

  socket.on("call-rejected", (data) => {
    try {
      const { to } = data;
      const receiverSocketId = findReceiverSocket(to);

      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("call-rejected", null, (err) => {
          if (err) {
            console.error("Failed to deliver call rejection:", err);
          }
        });
      }
    } catch (error) {
      console.error("Error in call-rejected:", error);
    }
  });

  socket.on("call-ended", (data) => {
    try {
        const { to } = data;

        // Find the receiver's socket ID
        const receiverSocketId = findReceiverSocket(to);

        if (receiverSocketId) {
           
            socket.to(receiverSocketId).timeout(5000).emit("call-ended", data);
            console.log(`Call end signal sent to receiver: ${receiverSocketId}`);
        } else {
            console.error(`Receiver socket not found for ID: ${to}`);
        }
    } catch (error) {
        console.error("Error in handling call-ended event:", error);
    }
});

}


module.exports = { videoCallHandler };
