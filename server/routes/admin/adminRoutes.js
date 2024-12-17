const express = require("express")
const adminRoute = express.Router()
const { logoutAdmin,getCertificates,forgotPassword,existsCheck,approveTutor,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,getUsers,listUser,unlistUser,unlisTtutor,lisTtutor, getCategories, addCategory, updateCategory, deleteCategory, listCourse, unlistCourse, getReports, openReport} = require("../../controller/adminController")
const handleTutorUpload = require('../../middleware/multer');
const verifyUser = require("../../middleware/authMiddleware");


adminRoute.get('/get-students',getUsers)
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.get('/get-tutors',getTutors);
adminRoute.get('/get-categories',getCategories);
adminRoute.get('/get-reports',getReports);
adminRoute.get('/certificates/:certificateId', getCertificates);

adminRoute.post('/forgot-password', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.post('/check-mail',existsCheck);
adminRoute.post('/instructor-applications', handleTutorUpload,submitInstructorApplication);
adminRoute.post("/logout",logoutAdmin);
adminRoute.post('/add-category',addCategory);
adminRoute.post('/open-report',openReport);

adminRoute.put('/instructor-applications/:id/review', reviewInstructorApplication);
adminRoute.put("/listuser/:id",listUser)
adminRoute.put("/unlistuser/:id",unlistUser)
adminRoute.put("/listtutor/:id",lisTtutor)
adminRoute.put("/unlisttutor/:id",unlisTtutor)
adminRoute.put("/unlistCourse/:id",unlistCourse)
adminRoute.put("/listCourse/:id",listCourse)
adminRoute.put("/update-category/:id",updateCategory)

adminRoute.patch('/approve-tutor/:applicationId',approveTutor)

adminRoute.delete("/delete-category/:id",deleteCategory);


module.exports = adminRoute
