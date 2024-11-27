const express = require("express")
const adminRoute = express.Router()
const { adminLogin,logoutAdmin,forgotPassword,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,students,tutors,listUser,unlistUser,unlisTtutor,lisTtutor,getCategories,updateCategory,deleteCategory,addCategory} = require("../../controller/adminController")
const verifyUser = require('../../middleware/authMiddleware');
const handleTutorUpload = require('../../middleware/multer');
const handleMulterError =require('../../middleware/mulerErrorHandler')


adminRoute.post('/login',adminLogin)
adminRoute.post('/forgot', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.get('/students',students)
adminRoute.post('/instructor-applications', handleTutorUpload,handleMulterError,submitInstructorApplication);
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.put('/instructor-applications/:id/review', reviewInstructorApplication);
adminRoute.get('/get-tutors',getTutors);
adminRoute.put("/listuser/:id",listUser)
adminRoute.put("/unlistuser/:id",unlistUser)
adminRoute.put("/listtutor/:id",lisTtutor)
adminRoute.put("/unlisttutor/:id",unlisTtutor)
adminRoute.get('/tutors',tutors)
adminRoute.post("/logout",logoutAdmin)
adminRoute.post('/addcategory', addCategory)
adminRoute.get('/categories', getCategories)
adminRoute.put('/category/:id', updateCategory)
adminRoute.delete('/category/:id', deleteCategory)

module.exports = adminRoute
