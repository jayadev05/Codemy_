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
  const { basicInfo, advancedInfo, curriculum, tutorId } = req.body;

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
     offerPrice } =
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
      offerPrice,
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

module.exports = { getCourses, createCourse,getCoursesByTutorId,getCoursesByStudentId};
