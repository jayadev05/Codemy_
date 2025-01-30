const Tutor = require("../model/tutorModel");
const User = require("../model/userModel");
const Course = require("../model/courseModel");
const Ratings = require("../model/ratingsModel");
const bcrypt = require("bcryptjs");
const Payouts = require("../model/payoutRequestModel");
const payoutRequestModel = require("../model/payoutRequestModel");

const getTutorDetails = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId)
      return res.status(400).json({ message: "TutorId is missing " });

    const tutor = await Tutor.findById(tutorId);
    const courses = await Course.find({ tutorId }).select(
      "enrolleeCount ratings averageRating"
    );
    const students = await User.find(); // Ensure this contains `activeCourses`

    const myCourses = courses.length;
    const totalReviews = courses.reduce(
      (acc, course) => acc + (course.ratings?.length || 0),
      0
    );

    // Extract course IDs from tutor's courses
    const courseIds = courses.map((course) => course._id.toString());

    // Create a set to track unique student IDs
    const uniqueStudents = new Set();

    // Iterate through students and check if they are enrolled in the given courses
    students.forEach((student) => {
      if (student.activeCourses) {
        student.activeCourses.forEach((courseId) => {
          if (courseIds.includes(courseId.toString())) {
            uniqueStudents.add(student._id.toString()); 
          }
        });
      }
    });

    const totalStudents = uniqueStudents.size;

    // Average rating
    const totalRatings = courses.reduce(
      (acc, course) => acc + (course.ratings?.length || 0),
      0
    );

    const weightedRatingSum = courses.reduce(
      (acc, course) =>
        acc + course.averageRating * (course.ratings?.length || 0),
      0
    );

    const averageRating =
      totalRatings > 0 ? weightedRatingSum / totalRatings : 0;

    res.status(200).json({
      message: "Tutor details fetched successfully",
      tutor,
      myCourses,
      totalReviews,
      totalStudents,
      averageRating,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const changePassword = async (req, res) => {
  const { currentPassword, newPassword, email } = req.body.passwordChange;

  try {
    // Find user by email
    const tutor = await Tutor.findOne({ email });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Check if the current password matches the stored hashed password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      tutor.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is Incorrect" });
    }

    if (currentPassword === newPassword) {
      return res
        .status(409)
        .json({ message: "New Password cannot be same as Current Password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    tutor.password = hashedNewPassword;
    await tutor.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateTutor = async (req, res) => {
  try {
    const {
      email,
      userName,
      phone,
      profileImg,
      bio,
      jobTitle,
      firstName,
      lastName,
    } = req.body;
    const fullName = `${firstName} ${lastName}`;

    const tutor = await Tutor.findOne({ email });
    if (!tutor) {
      console.log("Tutor not found:");
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Construct the updated data object conditionally based on what was provided
    const updatedData = {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(userName && { userName }),
      ...(phone && { phone }),
      ...(profileImg && { profileImg }),
      ...(bio && { bio }),
      ...(jobTitle && { jobTitle }),
    };

    const updatedTutor = await Tutor.findByIdAndUpdate(tutor._id, updatedData, {
      new: true,
    });

    res.status(200).json({ message: "Update successful", updatedTutor });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutTutor = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
};

const getReviewsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId)
      return res.status(400).josn({ message: "TutorID is missing / invalid" });

    const reviews = await Ratings.find({ courseId }).populate(
      "userId",
      "fullName profileImg"
    );

    res.status(200).json({ message: "Reviews fetched successfully", reviews });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to get reviews :Internal server error" });
  }
};

const makePayoutRequest = async (req, res) => {
  try {
    const { amount, tutorId, paymentDetails } = req.body;

    if (!amount || !tutorId) {
      return res
        .status(400)
        .json({ message: "Payload is missing / incorrect" });
    }

    const existingRequest = await Payouts.findOne({
      tutorId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(409).json({ message: "Payout request already exists" });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Convert `amountWithdrawn` to a number and update it
    const currentAmount = parseFloat(tutor.amountWithdrawn.toString());
    tutor.amountWithdrawn = currentAmount + amount;

    const payoutRequest = new Payouts({
      amount,
      tutorId,
      requestedAt: new Date(),
      status: "pending",
      paymentDetails,
    });

    await payoutRequest.save();
    await tutor.save();

    res.status(200).json({ message: "Payout requested successfully", tutor });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Failed to make payout request: Internal server error",
      });
  }
};

const getPayoutsHistory = async (req, res) => {
  try {
    const { tutorId } = req.params;

    if (!tutorId || tutorId === "undefined") {
      return res.status(400).json({ message: "Invalid tutorId" });
    }

    const payouts = await Payouts.find({ tutorId: String(tutorId) })
      .sort({ requestedAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Fetched payouts history successfully",
      payouts: payouts || [],
    });
  } catch (error) {
    console.error("Payouts history error:", error);
    return res.status(500).json({ message: "Failed to fetch payouts history" });
  }
};

module.exports = {
  logoutTutor,
  changePassword,
  updateTutor,
  getReviewsByCourseId,
  makePayoutRequest,
  getPayoutsHistory,
  getTutorDetails,
};
