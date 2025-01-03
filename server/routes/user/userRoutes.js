const express = require("express");
const userRoute = express.Router();
const { googleLogin,signUp, login, logoutUser, updateUser, sendOtp, changePassword, toggleNotifications, deleteNotification, getCoupons } = require('../../controller/userController');
const { verifyOtp}  = require('../../middleware/verifyOtp');
const verifyUser = require("../../middleware/authMiddleware");

userRoute.get('/get-coupons/:userId', getCoupons);


userRoute.post('/sendotp', sendOtp);
userRoute.post('/create',verifyOtp, signUp);
userRoute.post('/login', login);
userRoute.post('/google', googleLogin);

userRoute.put('/change-password',changePassword);
userRoute.put('/update-profile', updateUser);


userRoute.put('/toggle-notifications', toggleNotifications);
userRoute.patch('/clear-notifications/:userId', deleteNotification);

userRoute.post("/logout", logoutUser);






module.exports = userRoute;