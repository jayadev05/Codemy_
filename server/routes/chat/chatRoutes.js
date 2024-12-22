const express = require("express");
const { createChat, getChatsByUserId, getTutorsByUserId, getMessagesByChatId, createMessage, getStudentsByUserId } = require("../../controller/chatController");
const Chat=require('../../model/chatModel')
const Message=require('../../model/messageModel');
const chatRoute = express.Router();
const verifyUser = require('../../middleware/authMiddleware')



chatRoute.post('/create-chat',verifyUser,createChat);
chatRoute.post('/create-message',verifyUser,createMessage);


chatRoute.get("/get-all-chats/:userId",verifyUser ,getChatsByUserId);
chatRoute.get("/get-tutors",getTutorsByUserId);
chatRoute.get("/get-students/:tutorId",getStudentsByUserId);
chatRoute.get("/get-messages/:chatId",getMessagesByChatId);




module.exports = chatRoute;
