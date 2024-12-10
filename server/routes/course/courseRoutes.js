const express = require("express");
const courseRoute = express.Router();
const { createCourse,getCourses, getCoursesByTutorId, getCoursesByStudentId, deleteCourse, viewCourse, editCourse, getBasicCourseInfo} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware');
const { addLesson, updateLesson, getLessons, deleteLesson } = require("../../controller/lessonController");


courseRoute.post('/create-course',createCourse);
courseRoute.get('/get-courses',getCourses);
courseRoute.get('/get-course-info',getBasicCourseInfo);
courseRoute.get('/tutor-courses/:tutorId',getCoursesByTutorId);  
courseRoute.get('/student-courses/:studentId',getCoursesByStudentId);  
courseRoute.get('/view-course/:id',viewCourse)
courseRoute.get('/get-lessons/:courseId',getLessons);


courseRoute.put('/update-lesson/:lessonId', updateLesson);
courseRoute.put('/edit-course/:id', editCourse);

courseRoute.delete('/delete-course',deleteCourse);
courseRoute.delete('/delete-lesson',deleteLesson);




module.exports = courseRoute;