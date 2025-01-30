// chatUtils.js
export const handleChatDeletion = async (chatId, userId, axiosInstance, callbacks) => {
    const { onSuccess, onError } = callbacks;
    
    try {
      await axiosInstance.patch("/chat/delete-chat", {
        chatId,
        userId,
      });
      
      onSuccess();
    } catch (error) {
      console.error("Chat deletion error:", error);
      onError(error);
    }
  };
  
  export const handleChatCreation = async (recipientId, userId, userType, axiosInstance) => {
    try {
      const response = await axiosInstance.post("/chat/chats", {
        [userType === "user" ? "tutorId" : "userId"]: recipientId,
        [userType === "user" ? "userId" : "tutorId"]: userId,
      });
      
      return response.data;
    } catch (error) {
      console.error("Chat creation error:", error);
      throw error;
    }
  };
  
  export const updateChatsList = (chats, deletedChatId) => {
    return chats.filter(chat => chat._id !== deletedChatId);
  };