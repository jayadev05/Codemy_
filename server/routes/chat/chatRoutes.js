const express = require("express");
const { createChat, getChatsByUserId, getTutorsByUserId, getMessagesByChatId, createMessage, getStudentsByUserId, markMessageAsRead, deleteChat } = require("../../controller/chatController");
const Chat=require('../../model/chatModel')
const Message=require('../../model/messageModel');
const chatRoute = express.Router();
const verifyUser = require('../../middleware/authMiddleware')



chatRoute.post('/create-chat',createChat);
chatRoute.post('/create-message',createMessage);

chatRoute.put('/messages-read',markMessageAsRead);


chatRoute.get("/get-all-chats/:userId" ,verifyUser,getChatsByUserId);
chatRoute.get("/get-tutors",getTutorsByUserId);
chatRoute.get("/get-students/:tutorId",getStudentsByUserId);
chatRoute.get("/get-messages/:chatId",getMessagesByChatId);



chatRoute.patch("/delete-chat",deleteChat);




module.exports = chatRoute;
