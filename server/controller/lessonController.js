const Lesson = require("../model/lessonModel");
const Course=require('../model/courseModel');
const mongoose = require('mongoose');

const getLessons = async (req, res) => {

  const { courseId } = req.params;

	console.log(courseId)

  if (!courseId) {
    return res
      .status(404)
      .json({ message: "Lesson ID is missing or inappropriate" });
  }

  try {
    const lessons = await Lesson.find({ courseId });
		console.log("lessons in get lessons",lessons)
    if (!lessons) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    return res.status(200).json(lessons);

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching the lesson" });
  }
};

const addLesson=async(req,res)=>{
  try {

    const { 
      lessonTitle, 
      description, 
      video, 
      lessonNotes, 
      lessonThumbnail, 
      duration, 
      durationUnit,
      tutorId ,
      courseId
    } = req.body;

    console.log(req.body)

    
    if (!courseId || !tutorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID and tutor ID are required' 
      });
    }

  
    const newLesson = new Lesson({
      lessonTitle,
      description: description || '',
      video: video || '',
      lessonNotes: lessonNotes || null,
      lessonThumbnail: lessonThumbnail || null,
      duration: duration || 0,
      durationUnit: durationUnit || 'minute',
      tutorId,
      courseId
    });

  
    const savedLesson = await newLesson.save();

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $push: { lessons: savedLesson._id } },
      { new: true }
    );

   
    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      lesson: savedLesson,
      course:updatedCourse
    });

  } catch (error) {
  
    console.error('Error adding lesson:', error);
    
   s
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

  
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }

}

const updateLesson = async (req, res) => {
	const { ...updatedData } = req.body;
	const { lessonId } = req.params; 

	console.log(updatedData,"updateddata")
	console.log(lessonId,"lessonId")

	try {
		const lesson = await Lesson.findByIdAndUpdate(lessonId, updatedData, {
			new: true,
		});
		console.log(lesson,"lesson")

		if (!lesson) {
			return res.status(404).json({ message: "Lesson not found" });
		}

		return res.status(200).json({ 
			message: "Lesson updated successfully!", 
			lesson 
		});

	} catch (error) {
		console.error("Lesson Updating Error: ", error);
		return res.status(500).json({ 
			message: "Error updating lesson", 
			error: error.message 
		});
	}
};

const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.query;
    
    // Ensure IDs are converted to proper MongoDB ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    console.log("courseId", courseId);
    console.log("lessonId", lessonId);

    // Find the lesson by ID
    const lesson = await Lesson.findById(lessonObjectId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    console.log("lesson", lesson);

    // Check if the lesson belongs to the course
    if (lesson.courseId.toString() !== courseObjectId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this lesson" });
    }

    // Delete the lesson
    await Lesson.findByIdAndDelete(lessonObjectId);

    // Remove the lesson ID from the course's lessons array
    await Course.findByIdAndUpdate(courseObjectId, {
      $pull: { lessons: lessonObjectId },
    });

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error in deleteLesson:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




module.exports = { updateLesson ,getLessons,deleteLesson,addLesson};
