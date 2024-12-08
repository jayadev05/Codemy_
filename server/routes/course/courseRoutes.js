const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId, deleteCourse, viewCourse, editCourse} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware');
const { addLesson, updateLesson } = require("../../controller/lessonController");


courseRoute.post('/create-course',createCourse);
courseRoute.get('/get-courses',getCourses);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/student-courses/:studentId',getCoursesByStudentId);  

courseRoute.get('/view-course/:id',viewCourse)

courseRoute.put('/update-lesson/:id', updateLesson);
courseRoute.put('/edit-course/:id', editCourse);

courseRoute.delete('/delete-course',deleteCourse);



module.exports = courseRoute;