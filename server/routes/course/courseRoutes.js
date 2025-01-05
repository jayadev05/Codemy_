const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId, deleteCourse, viewCourse, editCourse, getBasicCourseInfo, addToWishlist, removeFromWishlist, getWishlist, playCourse,  rateCourse, getRatings,  handleCertificate} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware');
const { addLesson, updateLesson, getLessons, deleteLesson, updateCourseProgress } = require("../../controller/lessonController");
const { addToCart, viewCart, removeFromCart } = require("../../controller/cartController");


courseRoute.post('/create-course',createCourse);
courseRoute.post('/add-lesson',addLesson);
courseRoute.post('/addToWishlist',addToWishlist);
courseRoute.post('/addToCart',addToCart);
courseRoute.post('/add-rating',rateCourse);
courseRoute.post('/generate-certificate',handleCertificate);


courseRoute.get('/get-courses',getCourses);
courseRoute.get('/get-course-info',verifyUser,getBasicCourseInfo);
courseRoute.get('/get-wishlist',getWishlist);
courseRoute.get('/get-cart',viewCart);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/student-courses/:userId',getCoursesByStudentId);  
courseRoute.get('/view-course/:id',viewCourse)
courseRoute.get('/play-course',playCourse);
courseRoute.get('/get-lessons/:courseId',getLessons);
courseRoute.get('/get-ratings',getRatings);


courseRoute.put('/update-lesson/:lessonId', updateLesson);
courseRoute.put('/update-course-progress',updateCourseProgress);
courseRoute.put('/edit-course/:id',editCourse);

courseRoute.delete('/delete-course',deleteCourse);
courseRoute.delete('/delete-lesson',deleteLesson);
courseRoute.delete('/deleteFromWishlist',removeFromWishlist);
courseRoute.delete('/removeFromCart',removeFromCart);




module.exports = courseRoute;