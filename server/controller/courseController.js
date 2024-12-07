const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Course = require("../model/courseModel");
const Category = require("../model/categoryModel");
const mongoose = require('mongoose');

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};


const getCoursesByTutorId = async (req, res) => { 
    try { 
        const { tutorId } = req.params; 
        const courses = await Course.aggregate([ 
            { 
                $match: { 
                    tutorId: new mongoose.Types.ObjectId(tutorId) 
                } 
            }, 
            { 
                $lookup: { 
                    from: "categories", 
                    localField: "categoryId", 
                    foreignField: "_id", 
                    as: "category", 
                }, 
            }, 
            { 
                $unwind: "$category" 
            }, 
            { 
                $project: { 
                    title: 1, 
                    category: "$category.title", 
                    duration: 1, 
                    language: 1, 
                    level: 1, 
                    description: 1, 
                    thumbnail: 1, 
                    price: 1, 
                    enrolleeCount: 1, 
                    isListed: 1, 
                    created_at: 1, 
                    updated_at: 1, 
                    averageRating: 1, 
                    ratingsCount: 1, 
                }, 
            }, 
        ]); 

        console.log(courses);  
        return res.status(200).json({ courses }); 
    } catch (error) { 
        console.log("Get Courses By Tutor Id error : ", error); 
        return res.status(500).json({ message: "Internal server error" }); 
    } 
};

const getCoursesByStudentId = async (req, res) => {
	try {
		const { studentId } = req.params;
		const courses = await Course.aggregate([
			{ $match: { studentId:new mongoose.Types.ObjectId(studentIdId) } },
			{
				$lookup: {
					from: "categories",
					localField: "category_id",
					foreignField: "_id",
					as: "category",
				},
			},
			{
				$unwind: "$category",
			},
			{
				$project: {
					courseId: 1,
					title: 1,
					category: "$category.title",
					duration: 1,
					language: 1,
					level: 1,
					description: 1,
					thumbnail: 1,
					price: 1,
					enrolleeCount: 1,
					isListed: 1,
					createdAt: 1,
					updatedAt: 1,
					averageRating: 1,
					ratingsCount: 1,
				},
			},
		]);

		console.log(courses);

		return res.status(200).json({ courses });
	} catch (error) {
		console.log("Get Courses By Tutor Id error : ", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

const createCourse = async (req, res) => {
  const { basicInfo, advancedInfo, tutorId } = req.body;

  const {
    title,
    topic,
    duration,
    durationUnit,
    category,
    language,
    difficulty,
  } = basicInfo;

  const { thumbnail, 
    description,
     courseContent, 
     price, 
      } =
    advancedInfo;

  try {
    const categoryData = await Category.findOne({ title: category });

    const course = new Course({
      title,
      categoryId: categoryData._id,
      duration,
      durationUnit,
      courseContent,
      language,
      level: difficulty,
      topic,
      description,
      thumbnail,
      price,
      tutorId,
    });
    await course.save();
    return res
      .status(201)
      .json({ message: "Course created successfully", course });
  } catch (error) {
    console.log("Create Course error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editCourse=async(req,res)=>{
  try {
    
    const {
      title,
      topic,
      duration,
      durationUnit,
      category,
      language,
      difficulty,
      thumbnail, 
      description, 
      price, 
      tutorId
    } = req.body;
  
    const courseId=req.params;

    const course = await Course.findOne({ _id: courseId, tutorId: tutorId });;



  } catch (error) {
    console.log(error);
    res.status(500).json({message:error.message});
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { courseId,tutorId } = req.query; 

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this course" });
    }

    await Lesson.deleteMany({ course: courseId });

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCourses, createCourse,getCoursesByTutorId,getCoursesByStudentId};
