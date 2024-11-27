const express = require("express");
const userRoute = express.Router();
const { signUp, login, logoutUser, updateUser, forgotPassword, resetPassword, sendOtp, googleLogin } = require('../../controller/userController');
const verifyUser = require('../../middleware/authMiddleware')
const { verifyOtp}  = require('../../middleware/verifyOtp')

userRoute.post('/sendotp', sendOtp);
userRoute.post('/create',verifyOtp, signUp);
userRoute.post('/login', login);
userRoute.post('/forgot', forgotPassword);
userRoute.post('/reset/:token', resetPassword);
userRoute.put('/update', updateUser);
userRoute.post("/logout", logoutUser);






module.exports = userRoute;