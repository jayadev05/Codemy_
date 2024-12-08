const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Lesson=require("../model/lessonModel")
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
  const { 
    thumbnail,
    description,
    courseContent,
    price,
  } = advancedInfo;

  try {
    // Find the category
    const categoryData = await Category.findOne({ title: category });

    // Create the course
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

    // Save the course first to get its ID
    const savedCourse = await course.save();

    // If curriculum exists, process and save lessons
    if (curriculum && curriculum.length > 0) {
      // Map curriculum to lessons with the new course ID
      const lessons = curriculum.map(lesson => ({
        ...lesson,
        courseId: savedCourse._id,
      }));

      // Save all lessons
      const savedLessons = await Lesson.insertMany(lessons);

      //save lessons ref in course
      savedCourse.lessons = savedLessons.map(lesson => lesson._id);
      await savedCourse.save();

    }
      
     
    

    return res.status(201).json({ 
      message: "Course and lessons created successfully", 
      course: savedCourse
    });

  } catch (error) {
    console.log("Create Course error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const viewCourse = async (req, res) => {

  console.log(req.params);

  const { id } = req.params;

  try {
    
    if (!id) {
      return res.status(400).json({ message: "No course id available" });
    }
    
    
    const course = await Course.findById(id);

    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    
    res.status(200).json({ data: course, message: "Course fetched successfully" });

  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
};

const editCourse = async (req, res) => {
  try {
    const {
      title,
      topic,
      duration,
      durationUnit,
      category,
      language,
      level,
      thumbnail, 
      description, 
      price, 
      isListed,
      lessons,
      tutorId
    } = req.body.course;

    console.log(req.body);
  
    const { id } = req.params;

    // Validate course ID
    if (!id) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Find the course belonging to the specific tutor
    const course = await Course.findOne({ _id: id, tutorId: tutorId });
    
    // Check if course exists
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

 
    const updateFields = {
      ...(title && { title }),
      ...(topic && { topic }),
      ...(duration && { duration }),
      ...(durationUnit && { durationUnit }),
      ...(category && { category }),
      ...(language && { language }),
      ...(level && { level }),
      ...(thumbnail && { thumbnail }),
      ...(description && { description }),
      ...(price && { price }),
      ...(isListed !== undefined && { isListed }),
      ...(lessons && { lessons })
    };

    
    const updatedCourse = await Course.findByIdAndUpdate(
      course._id, 
      updateFields, 
      { 
        new: true,  
      }
    );

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error updating course", 
      error: error.message 
    });
  }
}

const deleteCourse = async (req, res) => {
  try {
    console.log("req recieved");
   console.log(req);
   const { courseId, tutorId } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }



    if (course.tutorId.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this course" });
    }

    await Lesson.deleteMany({ courseId: courseId });

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getCourses, createCourse,getCoursesByTutorId,getCoursesByStudentId,deleteCourse,viewCourse,editCourse};
