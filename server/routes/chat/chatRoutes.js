const express = require("express");
const { createChat, getChatsByUserId, getTutorsByUserId, getMessagesByChatId, createMessage, getStudentsByUserId, markMessageAsRead, deleteChat } = require("../../controller/chatController");
const Chat=require('../../model/chatModel')
const Message=require('../../model/messageModel');
const chatRoute = express.Router();
const verifyUser = require('../../middleware/authMiddleware')



chatRoute.post('/create-chat',verifyUser,createChat);
chatRoute.post('/create-message',verifyUser,createMessage);

chatRoute.put('/messages-read',markMessageAsRead);


chatRoute.get("/get-all-chats/:userId",verifyUser ,getChatsByUserId);
chatRoute.get("/get-tutors",getTutorsByUserId);
chatRoute.get("/get-students/:tutorId",verifyUser,getStudentsByUserId);
chatRoute.get("/get-messages/:chatId",verifyUser,getMessagesByChatId);



chatRoute.patch("/delete-chat",verifyUser,deleteChat);




module.exports = chatRoute;
