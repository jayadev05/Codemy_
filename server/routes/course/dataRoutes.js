const express = require("express");
const dataRoute = express.Router();
const { viewAllCourse, viewCourse, addCart,cartCount, viewCart,viewLessons,removeCart,viewAllCategory,viewCategory,viewAllTutors,viewTutor,toggleCourseVisibility,viewMyCoursesAsTutor } = require('../../controller/dataController');
const verifyUser = require('../../middleware/authMiddleware')

dataRoute.get('/viewallcourse', viewAllCourse); 
dataRoute.get('/viewallcategory',viewAllCategory)
dataRoute.get('/viewcourse/:courseId', viewCourse);
dataRoute.get('/viewlessons/:courseId',viewLessons)
dataRoute.get('/viewcategory/:categoryId', viewCategory);
dataRoute.post('/addcart/:courseId', addCart);
dataRoute.post('/cart', viewCart);
dataRoute.post('/cartcount/:userId',cartCount)
dataRoute.delete('/removecart', removeCart);
dataRoute.get('/viewalltutors',viewAllTutors)
dataRoute.get('/viewtutor/:id',viewTutor)
dataRoute.put('/togglecoursevisibility/:courseId', toggleCourseVisibility);
dataRoute.get('/viewmycoursestutor', viewMyCoursesAsTutor);


module.exports = dataRoute;
