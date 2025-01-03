const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId, deleteCourse, viewCourse, editCourse, getBasicCourseInfo, addToWishlist, removeFromWishlist, getWishlist, playCourse,  rateCourse, getRatings,  handleCertificate} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware');
const { addLesson, updateLesson, getLessons, deleteLesson, updateCourseProgress } = require("../../controller/lessonController");
const { addToCart, viewCart, removeFromCart } = require("../../controller/cartController");


courseRoute.post('/create-course',verifyUser,createCourse);
courseRoute.post('/add-lesson',verifyUser,addLesson);
courseRoute.post('/addToWishlist',verifyUser,addToWishlist);
courseRoute.post('/addToCart',verifyUser,addToCart);
courseRoute.post('/add-rating',verifyUser,rateCourse);
courseRoute.post('/generate-certificate',verifyUser,handleCertificate);


courseRoute.get('/get-courses',getCourses);
courseRoute.get('/get-course-info',verifyUser,getBasicCourseInfo);
courseRoute.get('/get-wishlist',verifyUser,getWishlist);
courseRoute.get('/get-cart',verifyUser,viewCart);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/student-courses/:userId',getCoursesByStudentId);  
courseRoute.get('/view-course/:id',verifyUser,viewCourse)
courseRoute.get('/play-course',verifyUser,playCourse);
courseRoute.get('/get-lessons/:courseId',verifyUser,getLessons);
courseRoute.get('/get-ratings',getRatings);


courseRoute.put('/update-lesson/:lessonId',verifyUser, updateLesson);
courseRoute.put('/update-course-progress', verifyUser,updateCourseProgress);
courseRoute.put('/edit-course/:id', verifyUser,editCourse);

courseRoute.delete('/delete-course',verifyUser,deleteCourse);
courseRoute.delete('/delete-lesson',verifyUser,deleteLesson);
courseRoute.delete('/deleteFromWishlist',verifyUser,removeFromWishlist);
courseRoute.delete('/removeFromCart',verifyUser,removeFromCart);




module.exports = courseRoute;