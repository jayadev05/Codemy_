const express = require("express");
const tutorRoute = express.Router();

const verifyUser = require('../../middleware/authMiddleware')
const { verifyOtp}  = require('../../middleware/verifyOtp')

tutorRoute.post('/sendotp')
tutorRoute.post('/login')
tutorRoute.post('/forgot');
tutorRoute.post('/reset/:token');
tutorRoute.put('/update')
tutorRoute.post("/logout")
tutorRoute.get('/profile')

module.exports=tutorRoute;
