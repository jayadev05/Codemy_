const express = require("express")
const adminRoute = express.Router()
const { logoutAdmin,getCertificates,getOrders,forgotPassword,existsCheck,approveTutor,submitInstructorApplication,getInstructorApplications,getTutors,reviewInstructorApplication,resetPassword,getUsers,listUser,unlistUser,unlisTtutor,lisTtutor, getCategories, addCategory, updateCategory, deleteCategory, listCourse, unlistCourse, getReports, openReport, sendNotification, handleReportStatus, getCoupons, createCoupon, deleteCoupon, toggleCouponStatus, getPayoutRequests, handlePayoutRequest, getInvoice, getSalesReport} = require("../../controller/adminController")
const handleTutorUpload = require('../../middleware/multer');
const verifyUser = require("../../middleware/authMiddleware");


adminRoute.get('/get-students',verifyUser,getUsers)
adminRoute.get('/instructor-applications', getInstructorApplications);
adminRoute.get('/get-tutors',verifyUser,getTutors);
adminRoute.get('/get-categories',getCategories);
adminRoute.get('/get-reports',verifyUser,getReports);
adminRoute.get('/get-coupons',verifyUser,getCoupons);
adminRoute.get('/certificates/:certificateId', getCertificates);
adminRoute.get('/payout-requests', getPayoutRequests);
adminRoute.get('/get-orders', getOrders);
adminRoute.get('/download-invoice/:orderId', getInvoice);
adminRoute.get('/download-sales-report', getSalesReport);

adminRoute.post('/forgot-password', forgotPassword);
adminRoute.post('/reset/:token', resetPassword);
adminRoute.post('/check-mail',existsCheck);
adminRoute.post('/instructor-applications', handleTutorUpload,submitInstructorApplication);
adminRoute.post("/logout",logoutAdmin);
adminRoute.post('/add-category',verifyUser,addCategory);
adminRoute.post('/create-coupon',verifyUser,createCoupon);
adminRoute.post('/open-report',openReport);
adminRoute.post('/send-notification',verifyUser,sendNotification);


adminRoute.put('/instructor-applications/:id/review',verifyUser, reviewInstructorApplication);
adminRoute.put("/listuser/:id",verifyUser,listUser)
adminRoute.put("/unlistuser/:id",verifyUser,unlistUser)
adminRoute.put("/listtutor/:id",verifyUser,lisTtutor)
adminRoute.put("/unlisttutor/:id",verifyUser,unlisTtutor)
adminRoute.put("/unlistCourse/:id",verifyUser,unlistCourse)
adminRoute.put("/listCourse/:id",verifyUser,listCourse)
adminRoute.put("/handle-payout",verifyUser,handlePayoutRequest)
adminRoute.put("/toggle-coupon-status/:couponId",verifyUser,toggleCouponStatus);
adminRoute.put("/update-category/:id",verifyUser,updateCategory)
adminRoute.put("/handle-report",verifyUser,handleReportStatus)

adminRoute.patch('/approve-tutor/:applicationId',approveTutor)

adminRoute.delete("/delete-category/:id",verifyUser,deleteCategory);
adminRoute.delete("/delete-coupon/:couponId",verifyUser,deleteCoupon);


module.exports = adminRoute
