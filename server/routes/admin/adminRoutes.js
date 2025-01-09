const express = require("express")
const adminRoute = express.Router()
const { logoutAdmin,getCertificates,getOrders,forgotPassword,existsCheck,approveTutor,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,getUsers,listUser,unlistUser,unlisTtutor,lisTtutor, getCategories, addCategory, updateCategory, deleteCategory, listCourse, unlistCourse, getReports, openReport, sendNotification, handleReportStatus, getCoupons, createCoupon, deleteCoupon, toggleCouponStatus, getPayoutRequests, handlePayoutRequest, getInvoice, getSalesReport} = require("../../controller/adminController")
const handleTutorUpload = require('../../middleware/multer');
const verifyUser = require("../../middleware/authMiddleware");


adminRoute.get('/students',getUsers)
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.get('/tutors',getTutors);
adminRoute.get('/categories',getCategories);
adminRoute.get('/reports',getReports);
adminRoute.get('/coupons',getCoupons);
adminRoute.get('/certificates/:certificateId',getCertificates);
adminRoute.get('/payout-requests',getPayoutRequests);
adminRoute.get('/orders', getOrders);
adminRoute.get('/orders/:orderId/invoice',verifyUser, getInvoice);
adminRoute.get('/sales-report',verifyUser, getSalesReport);

adminRoute.post('/auth/forgot-password', forgotPassword);
adminRoute.post('/auth/reset-password/:token', resetPassword);
adminRoute.post('/auth/check-mail',existsCheck);
adminRoute.post('/instructor-applications', handleTutorUpload,verifyUser,submitInstructorApplication);
adminRoute.post("/auth/logout",logoutAdmin);
adminRoute.post('/categories',verifyUser,addCategory);
adminRoute.post('/coupons',verifyUser,createCoupon);
adminRoute.post('/reports',verifyUser,openReport);
adminRoute.post('/notifications',verifyUser,sendNotification);


adminRoute.put('/instructor-applications/:id/review',verifyUser, reviewInstructorApplication);
adminRoute.put("/user/:id/list",verifyUser,listUser)
adminRoute.put("/user/:id/unlist",verifyUser,unlistUser)
adminRoute.put("/tutor/:id/list",verifyUser,lisTtutor)
adminRoute.put("/tutor/:id/unlist",verifyUser,unlisTtutor)
adminRoute.put("/course/:id/unlist",verifyUser,unlistCourse)
adminRoute.put("/course/:id/list",verifyUser,listCourse)
adminRoute.put("/handle-payout",verifyUser,handlePayoutRequest)
adminRoute.put("/coupons/:couponId/status",verifyUser,toggleCouponStatus);
adminRoute.put("/categories/:id",verifyUser,updateCategory)
adminRoute.put("/reports",verifyUser,handleReportStatus)

adminRoute.patch('/instructor-application/:applicationId/approve',verifyUser,approveTutor)

adminRoute.delete("/category/:id",verifyUser,deleteCategory);
adminRoute.delete("/coupon/:couponId",verifyUser,deleteCoupon);


module.exports = adminRoute
