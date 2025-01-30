const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId, deleteCourse, viewCourse, editCourse, getBasicCourseInfo, addToWishlist, removeFromWishlist, getWishlist, playCourse,  rateCourse, isRated,  handleCertificate, getRatingsbyCourseId} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware');
const { addLesson, updateLesson, getLessons, deleteLesson, updateCourseProgress } = require("../../controller/lessonController");
const { addToCart, viewCart, removeFromCart } = require("../../controller/cartController");


courseRoute.post('/courses',createCourse);
courseRoute.post('/lessons',addLesson);
courseRoute.post('/ratings',rateCourse);
courseRoute.post('/certificate/generate',handleCertificate);


courseRoute.get('/courses',getCourses);
courseRoute.get('/courses/basic-info',getBasicCourseInfo);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/user-courses/:userId',getCoursesByStudentId);  
courseRoute.get('/course/:id',viewCourse)
courseRoute.get('/play-course',playCourse);
courseRoute.get('/lessons/:courseId',getLessons);
courseRoute.get('/ratings',isRated);
courseRoute.get('/reviews',getRatingsbyCourseId);




courseRoute.put('/lesson/:lessonId', updateLesson);
courseRoute.put('/course-progress',updateCourseProgress);
courseRoute.put('/course/:id/edit',editCourse);

courseRoute.delete('/course',deleteCourse);
courseRoute.delete('/lesson',deleteLesson);





module.exports = courseRoute;