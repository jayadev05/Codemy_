const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Lesson = require("../model/lessonModel");
const Course = require("../model/courseModel");
const Category = require("../model/categoryModel");
const Wishlist = require("../model/wishlistModel");
const mongoose = require("mongoose");
const CourseProgress = require("../model/courseProgressModel");
const Ratings = require("../model/ratingsModel");

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinaryConfig");
const Certificate = require("../model/certificateModel");

const getBasicCourseInfo = async (req, res) => {


  const {
    search,
    sortBy,
    page,
    limit,
    courseId,
    categories,
    levels,
    ratings,
    priceRange,
  } = req.query;

  console.log(req.query);

  // Single Course Retrieval
  if (courseId) {
    try {
      const course = await Course.findById(courseId)
        .populate("tutorId", "fullName profileImg jobTitle bio")
        .populate("categoryId", "title")
        .select(
          "title description price topic lessons courseContent categoryId tutorId createdAt language level thumbnail isListed ratings averageRating duration durationUnit enrolleeCount"
        );

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({
        message: "Course details found successfully",
        course,
      });
    } catch (error) {
      console.error("Single course fetch error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Course Listing
  try {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 8;
    const skip = (pageNumber - 1) * limitNumber;

    let query = { isListed: true };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (levels) {
      query.level = { $in: levels };
    }

    if (priceRange) {
      query.price = {
        $gte: mongoose.Types.Decimal128.fromString(priceRange.min),
        $lte: mongoose.Types.Decimal128.fromString(priceRange.max),
      };
    }

    if (ratings) {
      // Convert ratings array strings to numbers
      const ratingNumbers = ratings.map((rating) => Number(rating));
      query.averageRating = { $gte: Math.min(...ratingNumbers) };
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === "trending") {
      sortOptions = { enrolleeCount: -1 };
    } else if (sortBy === "popular") {
      sortOptions = { averageRating: -1 };
    }

    const totalCount = await Course.countDocuments(query);

    let courses = await Course.find(query)
      .populate("tutorId", "fullName profileImg")
      .populate("categoryId", "title")
      .select(
        "title description price topic courseContent categoryId tutorId createdAt language level thumbnail isListed ratings averageRating duration durationUnit enrolleeCount"
      )
      .skip(skip)
      .limit(limitNumber)
      .sort(sortOptions);

    // Handle categories array filtering
    if (categories) {
      courses = courses.filter(
        (course) =>
          course.categoryId && categories.includes(course.categoryId.title)
      );
    }

    const hasMore = skip + courses.length < totalCount;

    res.status(200).json({
      courses,
      hasMore,
      total: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (error) {
    console.error("Courses fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const { sortBy } = req.query;

    let courses = await Course.find()
      .populate("tutorId", "fullName profileImg")
      .populate("categoryId", "title");

    if (sortBy) {
      if (sortBy === "trending")
        courses = courses.sort((a, b) => b.enrolleeCount - a.enrolleeCount);
      if (sortBy === "latest")
        courses = courses.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    const totalStudents = await User.find();
    const totalTutors = await Tutor.find();

    console.log("adsasdad", totalTutors, totalStudents);

    res
      .status(200)
      .json({
        courses,
        totalStudents: totalStudents.length,
        totalTutors: totalTutors.length,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

const getCoursesByTutorId = async (req, res) => {
  try {
    const { tutorId } = req.params;

    console.log("req.params :",req.params);

    const { sortBy } = req.query;

    if (!tutorId)
      return res
        .status(400)
        .json({ message: "Tutorid is missing / innapropriate" });

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
    const { userId } = req.params;
 console.log("req.params :",req.params);

    const user = await User.findById(userId);
    const courseIds = user?.activeCourses;

    const courses = await Course.find({ _id: { $in: courseIds } }).populate(
      "categoryId",
      "title"
    );

    const courseProgress = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds },
    });

    // Merge course progress into courses
    const coursesWithProgress = courses.map((course) => {
      const progress = courseProgress.find(
        (cp) => String(cp.courseId) === String(course._id)
      );

      return {
        ...course.toObject(),
        progress: progress || null,
      };
    });

    return res.status(200).json({ courses: coursesWithProgress });
  } catch (error) {
    console.error("Get Courses By Student Id error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const playCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.query;

    console.log("req.query",req.query)

    if (!courseId || !userId) {
      return res.status(400).json({ message: "Missing course or user ID" });
    }

    // Verify user has purchased the course
    const user = await User.findById(userId);
    if (!user || !user.activeCourses.includes(courseId)) {
      return res
        .status(401)
        .json({ message: "User does not have access to this course" });
    }

    const course = await Course.findById(courseId)
      .populate({
        path: "lessons",
        select:
          "lessonTitle duration durationUnit description lessonThumbnail lessonNotes video",
      })
      .populate("tutorId", "fullName");

    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    // If no progress exists, create a new progress record
    if (!courseProgress) {
      const newCourseProgress = new CourseProgress({
        userId,
        courseId,
        lessonsProgress: course.lessons.map((lesson) => ({
          lessonId: lesson._id,
          status: "not-started",
        })),
      });
      await newCourseProgress.save();
    }

    const CourseResponse = {
      courseId: course._id,
      title: course.title,
      description: course.description,
      tutor: course.tutorId.fullName,
      tutorId: course.tutorId._id,
      level: course.level,
      language: course.language,
      certificateUrl: courseProgress.certificateUrl || null,
      totalLessons: course.lessons.length,
      lessons: course.lessons.map((lesson) => {
        const lessonProgress = courseProgress
          ? courseProgress.lessonsProgress.find(
              (progress) =>
                progress.lessonId.toString() === lesson._id.toString()
            )
          : null;

        return {
          id: lesson._id,
          title: lesson.lessonTitle,
          duration: lesson.duration,
          durationUnit: lesson.durationUnit,
          thumbnail: lesson.lessonThumbnail,
          description: lesson.description,
          notes: lesson.lessonNotes,
          video: lesson.video,
          status: lessonProgress ? lessonProgress.status : "not-started",
        };
      }),
      progress: {
        percentage: courseProgress
          ? courseProgress.progressPercentage.toFixed(0)
          : 0,
        isCompleted: courseProgress ? courseProgress.isCompleted : false,
      },
    };

    res
      .status(200)
      .json({ message: "Course fetched successfully", CourseResponse });
  } catch (error) {
    console.error("Error playing course:", error);
    res
      .status(500)
      .json({ message: "Failed to play course", error: error.message });
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
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "No course id available" });
    }

    const course = await Course.findById(id);
    console.log("course", course);

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
      courseContent,
      price,
      isListed,
      lessons,
      tutorId,
    } = req.body.course;

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
      ...(courseContent && { courseContent }),
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
  const session = await mongoose.startSession();
  session.startTransaction();

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

    const errors = [];
    
    // Remove course from users' active courses
    try {
      await User.updateMany(
        { activeCourses: courseId },
        { $pull: { activeCourses: courseId } }
      );
    } catch (error) {
      errors.push(`Error removing from active courses: ${error.message}`);
    }

  

    // Delete course progress records
    try {
      await CourseProgress.deleteMany({ courseId: courseId });
    } catch (error) {
      errors.push(`Error deleting course progress: ${error.message}`);
    }

    // Delete course ratings
    try {
      await Ratings.deleteMany({ courseId: courseId });
    } catch (error) {
      errors.push(`Error deleting ratings: ${error.message}`);
    }

    // Delete course lessons
    try {
      await Lesson.deleteMany({ courseId: courseId });
    } catch (error) {
      errors.push(`Error deleting lessons: ${error.message}`);
    }

  



    // Finally, delete the course itself
    try {
      await Course.findByIdAndDelete(courseId);
    } catch (error) {
      errors.push(`Error deleting course: ${error.message}`);
    }

    // If there were any errors during the process, return them
    if (errors.length > 0) {
      return res.status(500).json({
        message: "Partial deletion occurred with errors",
        errors: errors
      });
    }

    res.status(200).json({ message: "Course and all related data deleted successfully" });

  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Validate input
    if (!userId || !courseId) {
      return res
        .status(400)
        .json({ message: "UserId and CourseId are required" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create a new wishlist if it doesn't exist
      wishlist = new Wishlist({
        userId,
        courses: [{ courseId, addedAt: new Date() }],
      });
    } else {
      // Check if the course is already in the wishlist
      const isAlreadyInWishlist = wishlist.courses.some(
        (course) => course.courseId.toString() === courseId
      );

      if (isAlreadyInWishlist) {
        return res.status(400).json({ message: "Course already in wishlist" });
      }

      // Add the new course
      wishlist.courses.push({ courseId, addedAt: new Date() });
    }

    // Save the wishlist
    await wishlist.save();
    res.status(200).json({ message: "Added to wishlist successfully" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the wishlist for the given user and populate course details
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: "courses.courseId",
      select: "title description price thumbnail averageRating",
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        courses: [],
      });
    }

    res.status(200).json({ wishlist: wishlist.courses });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, courseId } = req.query;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "wishlist not found" });
    }

    const updatedCourses = wishlist.courses.filter(
      (course) => course.courseId.toString() !== courseId
    );

    if (updatedCourses.length === wishlist.courses.length) {
      return res.status(404).json({ message: "Course not found in wishlist" });
    }

    wishlist.courses = updatedCourses;
    await wishlist.save();

    res.status(200).json({ message: "Removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Failed to remove item form wishlist" });
  }
};

const handleCertificate = async (req, res) => {
  const { userId, courseId, courseName } = req.body;

  if (!userId || !courseId || !courseName) {
    return res.status(400).json({
      error: "User ID, Course ID, and Course Name are required.",
      success: false,
    });
  }

  try {
    let certificate = await Certificate.findOne({ userId, courseId });

    if (certificate) {
      return res.status(200).json({
        message: "Certificate already exists",
        certificateUrl: certificate.certificateUrl,
        success: true,
      });
    }

    // Ensure certificates directory exists
    const certificatesDir = path.join(__dirname, "../certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        success: false,
      });
    }

    // Create canvas for certificate
    const canvas = createCanvas(2000, 1414);
    const ctx = canvas.getContext("2d");

    // Load certificate template
    const templatePath = path.join(
      __dirname,
      "../utils/template/certificate-template.png"
    );
    const template = await loadImage(templatePath);
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // Styling for text
    ctx.font = "bold 50px 'Times New Roman', serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";

    // Add certificate details
    const currentDate = new Date().toLocaleDateString();

    // Adjust text positions based on the provided certificate image
    ctx.fillText(user.fullName, canvas.width / 2 + 130, 660);
    ctx.fillText(courseName, canvas.width / 2 + 130, 860);
    ctx.fillText(currentDate, canvas.width / 2 + 165, 960);

    // Save and upload to Cloudinary
    const tempFileName = `${user.fullName.replace(/\s/g, "_")}-certificate.png`;
    const tempFilePath = path.join(certificatesDir, tempFileName);

    // Write file
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(tempFilePath, buffer);

    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "certificates",
      use_filename: true,
      unique_filename: false,
    });

    // Delete temporary file
    fs.unlinkSync(tempFilePath);

    certificate = new Certificate({
      userId,
      courseId,
      certificateUrl: result.secure_url,
    });
    await certificate.save();

    const updatedProgress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      { $set: { certificateUrl: result.secure_url } },
      { new: true, upsert: false }
    );

    if (!updatedProgress) {
      return res.status(404).json({
        error: "Course progress not found.",
        success: false,
      });
    }

    res.status(200).json({
      message: "Certificate generated successfully!",
      certificateUrl: result.secure_url,
      success: true,
    });
  } catch (error) {
    console.error("Error handling certificate:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
      success: false,
    });
  }
};

const rateCourse = async (req, res) => {
  const { rating, feedback, courseId, userId } = req.body;

  if (!rating || !courseId || !userId) {
    return res.status(400).json({ message: "Missing or invalid details." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const existingRating = await Ratings.findOne({ userId, courseId });

    //checking if lesson has been updated

    const courseLessons = await Lesson.find({ _id: { $in: course.lessons } });

    let isLessonUpdated = false;
    if (existingRating) {
      isLessonUpdated = courseLessons.some(
        (lesson) => lesson.updatedAt > existingRating.updatedAt
      );
    }

    if (existingRating && !isLessonUpdated) {
      return res
        .status(400)
        .json({ message: "You have already rated this course." });
    }

    if (existingRating && isLessonUpdated) {
      //remove old rating
      course.ratings = course.ratings.filter(
        (r) => r !== existingRating.rating
      );

      //add new rating
      course.ratings.push(rating);

      existingRating.rating = rating;
      existingRating.feedback = feedback;
      existingRating.updatedAt = new Date();

      await existingRating.save();

      // Recalculate average rating
      const totalRatings = course.ratings.length;
      const averageRating =
        course.ratings.reduce((sum, value) => sum + value, 0) / totalRatings;
      course.averageRating = averageRating;

      await course.save();

      return res.status(200).json({
        message: "Rating updated successfully due to lesson updates.",
      });
    }

    // For initial rating

    course.ratings.push(rating);

    //calcuate average rating
    const totalRatings = course.ratings.length;
    const averageRating =
      course.ratings.reduce((sum, value) => sum + value, 0) / totalRatings;

    course.averageRating = averageRating;

    await course.save();

    // Create a new user rating
    const userRating = new Ratings({
      userId,
      courseId,
      rating,
      feedback,
    });

    await userRating.save();

    res.status(200).json({
      message: "Rating submitted successfully.",
    });
  } catch (error) {
    console.error("Error occurred while rating the course:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const isRated = async (req, res) => {
  try {
    const { userId, courseId } = req.query;

    const rating = await Ratings.findOne({ userId, courseId });

    res.status(200).json({
      hasRated: !!rating,
      rating: rating ? rating.rating : null,
    });
  } catch (error) {
    console.log("Error in fetching ratings", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRatingsbyCourseId = async (req, res) => {
  try {
    const { courseId } = req.query;

    console.log("course id ", courseId);
    console.log("req query ", req.query, req.params);

    const ratings = await Ratings.find({ courseId }).populate(
      "userId",
      "fullName profileImg"
    );

    console.log(ratings);

    res.status(200).json({
      message: "Ratings fetched succesfully",
      ratings: ratings,
    });
  } catch (error) {
    console.log("Error in fetching ratings", error);
    res.status(500).json({ message: "Internal server error" });
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
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  playCourse,
  handleCertificate,
  rateCourse,
  isRated,
  getRatingsbyCourseId,
};
