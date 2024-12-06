const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware')

courseRoute.post('/create-course',createCourse);
courseRoute.get('/get-courses',getCourses);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/student-courses/:studentId',getCoursesByStudentId);  

// courseRoute.post('/addlesson/:id', addLesson);
// courseRoute.get('/viewcourse/:id',viewCourse);
// courseRoute.delete('/viewcourse/',deleteCourse);
// courseRoute.post('/viewdata/:id',viewData)
// courseRoute.put('/editData/:id',editCourse)
// courseRoute.get('/editlesson', editLesson);
// courseRoute.put('/editlesson,updateLesson);
// courseRoute.delete('/editlesson/',deleteLesson);


module.exports = courseRoute;