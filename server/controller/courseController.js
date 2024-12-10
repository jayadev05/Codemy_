const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Lesson = require("../model/lessonModel");
const Course = require("../model/courseModel");
const Category = require("../model/categoryModel");
const mongoose = require("mongoose");

const getBasicCourseInfo = async (req, res) => {
  const { search, sortBy, filter } = req.query;

  console.log("search", search, "sort", sortBy);

  let query = { isListed: true };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  try {
    let courses = await Course.find(query)
      .populate("tutorId", "fullName profileImg")
      .populate("categoryId", "title")
      .select(
        "title description price topic courseContent categoryId tutorId createdAt language level thumbnail isListed ratings averageRating duration durationUnit enrolleeCount"
      );

    // Apply sorting
    if (sortBy === "latest") {
      courses = courses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "trending") {
      courses = courses.sort((a, b) => b.enrolleeCount - a.enrolleeCount);
    } else if (sortBy === "popular") {
      courses = courses.sort((a, b) => b.averageRating - a.averageRating);
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

const getCourses = async (req, res) => {
  try {
    // Fetch courses and populate tutor name
    const courses = await Course.find()
      .populate("tutorId", "fullName profileImg")
      .populate("categoryId", "title");

    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

const getCoursesByTutorId = async (req, res) => {
 

  try {
    const { tutorId } = req.params;
    const { sortBy } = req.query;

    const query = {};

    let courses = await Course.find({ tutorId }).populate(
      "categoryId",
      "title"
    );

    // Apply sorting
    if (sortBy === "latest") {
      courses = courses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "trending") {
      courses = courses.sort((a, b) => b.enrolleeCount - a.enrolleeCount);
    } else if (sortBy === "popular") {
      courses = courses.sort((a, b) => b.averageRating - a.averageRating);
    }

    return res.status(200).json({ courses });
    
  } catch (error) {
    console.log("Get Courses By Tutor Id error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const courses = await Course.find({ studentId }).populate(
      "categoryId",
      "title"
    );

    console.log(courses);

    return res.status(200).json({ courses });
  } catch (error) {
    console.log("Get Courses By Tutor Id error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createCourse = async (req, res) => {
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
    courseContent,
    price,
    lessons,
    tutorId,
  } = req.body;

  try {
    // Find the category
    const categoryData = await Category.findOne({ title: category });

    // Create the course
    const course = new Course({
      title,
      categoryId: categoryData._id,
      tutorId,
      duration,
      durationUnit,
      courseContent,
      language,
      level: difficulty,
      topic,
      description,
      thumbnail,
      price,
    });

    // Save the course first to get its ID
    const savedCourse = await course.save();

    // If curriculum exists, process and save lessons
    if (lessons && lessons.length > 0) {
      const updatedLessons = lessons.map((lesson) => ({
        ...lesson,
        courseId: savedCourse._id,
      }));

      // Save all lessons
      const savedLessons = await Lesson.insertMany(updatedLessons);

      //save lessons ref in course
      savedCourse.lessons = savedLessons.map((lesson) => lesson._id);
      await savedCourse.save();
    }

    return res.status(201).json({
      message: "Course and lessons created successfully",
      course: savedCourse,
    });
  } catch (error) {
    console.log("Create Course error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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

    res
      .status(200)
      .json({ data: course, message: "Course fetched successfully" });
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
      tutorId,
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
      ...(lessons && { lessons }),
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
      course: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating course",
      error: error.message,
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId, tutorId } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.tutorId.toString() !== tutorId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this course" });
    }

    await Lesson.deleteMany({ courseId: courseId });

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getBasicCourseInfo,
  getCourses,
  createCourse,
  getCoursesByTutorId,
  getCoursesByStudentId,
  deleteCourse,
  viewCourse,
  editCourse,
};
