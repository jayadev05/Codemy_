const express = require("express");
const tutorRoute = express.Router();
const{signUp,login,logoutUser,updateTutor,sendOtp,forgotPassword,resetPassword,viewProfile}=require('../../controller/tutorController')
const verifyUser = require('../../middleware/authMiddleware')
const { verifyOtp}  = require('../../middleware/verifyOtp')

tutorRoute.post('/sendotp',sendOtp)
tutorRoute.post('/create',verifyOtp,signUp)
tutorRoute.post('/login',login)
tutorRoute.post('/forgot', forgotPassword);
tutorRoute.post('/reset/:token', resetPassword);
tutorRoute.put('/update',updateTutor)
tutorRoute.post("/logout",logoutUser)
tutorRoute.get('/profile',viewProfile)

module.exports=tutorRoute;
