const express = require("express");
const userRoute = express.Router();
const { googleLogin,signUp, login, logoutUser, updateUser, sendOtp, changePassword } = require('../../controller/userController');
const { verifyOtp}  = require('../../middleware/verifyOtp');
const verifyUser = require("../../middleware/authMiddleware");

userRoute.post('/sendotp', sendOtp);
userRoute.post('/create',verifyOtp, signUp);
userRoute.post('/login', login);
userRoute.post('/google', googleLogin);
userRoute.put('/change-password',changePassword);
userRoute.put('/update-profile', updateUser);
userRoute.post("/logout", logoutUser);






module.exports = userRoute;