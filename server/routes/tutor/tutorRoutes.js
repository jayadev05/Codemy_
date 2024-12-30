const express = require("express");
const { changePassword, logoutTutor, updateTutor, getReviewsByCourseId, makePayoutRequest, getPayoutsHistory } = require("../../controller/tutorController");
const tutorRoute = express.Router();



tutorRoute.get('/get-reviews/:courseId',getReviewsByCourseId);
tutorRoute.get('/payouts-history/:tutorId',getPayoutsHistory);

tutorRoute.post('/payout-request',makePayoutRequest);
tutorRoute.post("/logout",logoutTutor);

tutorRoute.put('/change-password',changePassword);
tutorRoute.put('/update-profile',updateTutor);


module.exports = tutorRoute;
