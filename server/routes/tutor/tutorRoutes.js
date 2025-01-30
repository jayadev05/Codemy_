const express = require("express");
const { changePassword, logoutTutor, updateTutor, getReviewsByCourseId, makePayoutRequest, getPayoutsHistory,getTutorDetails } = require("../../controller/tutorController");
const verifyUser = require("../../middleware/authMiddleware");
const tutorRoute = express.Router();



tutorRoute.get('/reviews/:courseId',getReviewsByCourseId);
tutorRoute.get('/tutor/:tutorId',getTutorDetails);
tutorRoute.get('/payouts/:tutorId/history',getPayoutsHistory);

tutorRoute.post('/payouts/requests',makePayoutRequest);
tutorRoute.post("/auth/logout",logoutTutor);

tutorRoute.put('/password',changePassword);
tutorRoute.put('/profile',updateTutor);


module.exports = tutorRoute;
