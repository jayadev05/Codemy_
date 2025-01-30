const express = require("express");
const {
  createChat,
  getChatsByUserId,
  getTutorsByUserId,
  getMessagesByChatId,
  createMessage,
  getStudentsByUserId,
  markMessageAsRead,
  deleteChat,
} = require("../../controller/chatController");
const Chat = require("../../model/chatModel");
const Message = require("../../model/messageModel");
const chatRoute = express.Router();
const verifyUser = require("../../middleware/authMiddleware");

chatRoute.post("/chats", createChat);
chatRoute.post("/messages", createMessage);

chatRoute.put("/messages/read", markMessageAsRead);

chatRoute.get("/chats/:userId", verifyUser, getChatsByUserId);
chatRoute.get("/tutors", getTutorsByUserId);
chatRoute.get("/tutor/:tutorId/students", getStudentsByUserId);
chatRoute.get("/chats/:chatId/messages", getMessagesByChatId);

chatRoute.patch("/delete-chat", deleteChat);

module.exports = chatRoute;
