const express = require("express");
const courseRoute = express.Router();
const { addCourse ,addLesson,viewCourse,deleteCourse,viewData,editCourse,deleteLesson,editLesson, updateLesson} = require('../../controller/courseController');
const verifyUser = require('../../middleware/authMiddleware')

courseRoute.post('/addcourse',verifyUser,addCourse);
courseRoute.post('/addlesson/:id',verifyUser, addLesson);
courseRoute.get('/viewcourse/:id',verifyUser,viewCourse);
courseRoute.delete('/viewcourse/',verifyUser,deleteCourse);
courseRoute.post('/viewdata/:id',verifyUser,viewData)
courseRoute.put('/editData/:id',verifyUser,editCourse)
courseRoute.get('/editlesson', verifyUser,editLesson);
courseRoute.put('/editlesson', verifyUser,updateLesson);
courseRoute.delete('/editlesson/',verifyUser,deleteLesson);


module.exports = courseRoute;