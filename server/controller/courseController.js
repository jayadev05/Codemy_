const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Course = require("../model/courseModel");
const Category = require("../model/categoryModel");

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch courses" });
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
  const { thumbnail, description, courseContent, price, offerPrice } =
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

module.exports = { getCourses, createCourse };
