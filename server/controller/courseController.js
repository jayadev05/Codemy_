const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Course=require('../model/courseModel')



const getCourses=async(req,res)=>{
try {
    const courses= await Course.find();
    res.status(200).json({courses});
} catch (error) {
    console.log(error);
    res.status(500).json({message:"Failed to fetch courses"})
    
}
}

const createCourse= async(req,res)=>{
    const {title,
        course_id,
        description,
        thumbnail,
        topic,
        duration,
		language,
		level,
        price,
        tutor_id}=req.body

        try {
            const categoryData = await Category.findOne({ title: category });
            const course = new Course({
                course_id,
                title,
                category_id: categoryData._id,
                duration,
                language,
                level,
                topic,
                description,
                thumbnail,
                price,
                tutor_id,
            });
            await course.save();
            return res
                .status(201)
                .json({ message: "Course created successfully", course });
        } catch (error) {
            console.log("Create Course error : ", error);
            return res.status(500).json({ message: "Internal server error" });
        }

}

module.exports={getCourses,createCourse};