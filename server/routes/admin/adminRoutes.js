const express = require("express")
const adminRoute = express.Router()
const { logoutAdmin,getCertificates,forgotPassword,existsCheck,approveTutor,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,getUsers,listUser,unlistUser,unlisTtutor,lisTtutor} = require("../../controller/adminController")
const handleTutorUpload = require('../../middleware/multer');
const handleMulterError =require('../../middleware/mulerErrorHandler');
const verifyUser = require("../../middleware/authMiddleware");


adminRoute.post('/forgot-password', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.get('/get-students',getUsers)
adminRoute.post('/check-mail',existsCheck);
adminRoute.post('/instructor-applications', handleTutorUpload,handleMulterError,submitInstructorApplication);
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.put('/instructor-applications/:id/review', reviewInstructorApplication);
adminRoute.get('/get-tutors',getTutors);
adminRoute.get('/certificates/:certificateId', getCertificates);
adminRoute.patch('/approve-tutor/:applicationId',approveTutor)
adminRoute.put("/listuser/:id",listUser)
adminRoute.put("/unlistuser/:id",unlistUser)
adminRoute.put("/listtutor/:id",lisTtutor)
adminRoute.put("/unlisttutor/:id",unlisTtutor)
adminRoute.post("/logout",logoutAdmin)

module.exports = adminRoute
