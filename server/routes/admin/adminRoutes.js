const express = require("express")
const adminRoute = express.Router()
const { logoutAdmin,getCertificates,forgotPassword,existsCheck,approveTutor,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,getUsers,listUser,unlistUser,unlisTtutor,lisTtutor, getCategories, addCategory, updateCategory, deleteCategory, listCourse, unlistCourse, getReports, openReport, sendNotification, handleReportStatus} = require("../../controller/adminController")
const handleTutorUpload = require('../../middleware/multer');
const verifyUser = require("../../middleware/authMiddleware");


adminRoute.get('/get-students',verifyUser,getUsers)
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.get('/get-tutors',verifyUser,getTutors);
adminRoute.get('/get-categories',getCategories);
adminRoute.get('/get-reports',verifyUser,getReports);
adminRoute.get('/certificates/:certificateId', getCertificates);

adminRoute.post('/forgot-password', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.post('/check-mail',existsCheck);
adminRoute.post('/instructor-applications', handleTutorUpload,submitInstructorApplication);
adminRoute.post("/logout",logoutAdmin);
adminRoute.post('/add-category',verifyUser,addCategory);
adminRoute.post('/open-report',openReport);
adminRoute.post('/send-notification',verifyUser,sendNotification);


adminRoute.put('/instructor-applications/:id/review',verifyUser, reviewInstructorApplication);
adminRoute.put("/listuser/:id",verifyUser,listUser)
adminRoute.put("/unlistuser/:id",verifyUser,unlistUser)
adminRoute.put("/listtutor/:id",verifyUser,lisTtutor)
adminRoute.put("/unlisttutor/:id",verifyUser,unlisTtutor)
adminRoute.put("/unlistCourse/:id",verifyUser,unlistCourse)
adminRoute.put("/listCourse/:id",verifyUser,listCourse)
adminRoute.put("/update-category/:id",verifyUser,updateCategory)
adminRoute.put("/handle-report",verifyUser,handleReportStatus)

adminRoute.patch('/approve-tutor/:applicationId',approveTutor)

adminRoute.delete("/delete-category/:id",verifyUser,deleteCategory);


module.exports = adminRoute
