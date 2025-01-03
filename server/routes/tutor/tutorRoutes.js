const express = require("express");
const { changePassword, logoutTutor, updateTutor, getReviewsByCourseId, makePayoutRequest, getPayoutsHistory,getTutorDetails } = require("../../controller/tutorController");
const verifyUser = require("../../middleware/authMiddleware");
const tutorRoute = express.Router();



tutorRoute.get('/get-reviews/:courseId',getReviewsByCourseId);
tutorRoute.get('/get-tutorInfo/:tutorId',getTutorDetails);
tutorRoute.get('/payouts-history/:tutorId',verifyUser,getPayoutsHistory);

tutorRoute.post('/payout-request',verifyUser,makePayoutRequest);
tutorRoute.post("/logout",logoutTutor);

tutorRoute.put('/change-password',verifyUser,changePassword);
tutorRoute.put('/update-profile',updateTutor);


module.exports = tutorRoute;
