const express = require("express");
const { changePassword, logoutTutor, updateTutor } = require("../../controller/tutorController");
const tutorRoute = express.Router();





tutorRoute.put('/change-password',changePassword);
tutorRoute.post("/logout",logoutTutor);
tutorRoute.put('/update-profile',updateTutor);


module.exports = tutorRoute;
