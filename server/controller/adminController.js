const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin = require("../model/adminModel");
const Course = require("../model/courseModel");
const Report = require("../model/reportModel");
const Coupon = require("../model/couponModel");
const Blacklist = require("../model/blacklistModel");
const Order = require("../model/orderModel");
const InstructorApplication = require("../model/tutorApplication");
const Category = require("../model/categoryModel");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const fsp = fs.promises; // For promise-based methods
const {
  mailSender,
  tutorApprovedEmailTemplate,
  passwordResetTemplate,
} = require("../utils/nodeMailer");
const generateDefaultPassword = require("../utils/generateDefaultPasswordd");
const { getIO } = require("../socket/socketEvent");
const Payouts = require("../model/payoutRequestModel");
const { generateInvoice } = require("../utils/generateInvoice");
const { generateSalesReport } = require("../utils/generateSalesReport");
require("dotenv").config();

// Controllers

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      type: "error",
    });
  }

  try {
    // Normalize email for consistent searching
    const normalizedEmail = email.trim().toLowerCase();

    let [user, admin, tutor] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Admin.findOne({ email: normalizedEmail }),
      Tutor.findOne({ email: normalizedEmail }),
    ]);

    let currentUser = user || tutor || admin;

    // If no user found, return a generic success-like response
    if (!currentUser) {
      return res.status(200).json({
        message: "If an account exists, a reset link will be sent",
        type: "success",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Update user with reset token and expiration
    currentUser.resetPasswordToken = resetToken;
    currentUser.resetPasswordExpires = Date.now() + 900000; // 15 mins

    await currentUser.save();

    // Create reset URL
    const resetURL = `https://codemy.jayadevnair.in/reset-password/${resetToken}`;

    try {
      // Attempt to send reset email
      const { subject, htmlContent } = passwordResetTemplate(resetURL);

      await mailSender(normalizedEmail, subject, htmlContent);

      // Successful email send
      return res.status(200).json({
        message: "Password reset link has been sent to your email",
        type: "success",
      });
    } catch (emailError) {
      // Comprehensive email sending error handling
      console.error("Email sending failed:", emailError);

      // Clear reset token on email failure
      currentUser.resetPasswordToken = undefined;
      currentUser.resetPasswordExpires = undefined;
      await currentUser.save();

      return res.status(500).json({
        message: "Unable to send password reset email. Please try again later.",
        type: "error",
        details:
          process.env.NODE_ENV === "development"
            ? emailError.message
            : undefined,
      });
    }
  } catch (error) {
    // Comprehensive server-side error handling
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred. Please try again.",
      type: "error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const [user, tutor, admin] = await Promise.all([
      User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }),
      Tutor.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }),
      Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }),
    ]);

    const currentUser = user || tutor || admin;

    if (!currentUser) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    currentUser.password = encryptedPassword;
    currentUser.resetPasswordToken = undefined;
    currentUser.resetPasswordExpires = undefined;

    await currentUser.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUsers = async (req, res) => {
  try {
    const students = await User.find().sort({ createdAt: -1 });

    if (!students) {
      return res.status(404).json({ message: "No students found" });
    }
    return res
      .status(200)
      .json({ message: "Students data fetched successfully", students });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutAdmin = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

const getTutors = async (req, res) => {
  try {
    // Fetch tutors
    const tutors = await Tutor.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      tutors,
    });
  } catch (error) {
    console.error("Get Tutors Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tutors",
      error: error.message,
    });
  }
};

const submitInstructorApplication = async (req, res) => {
  try {
    const { fullName, email, phone, field, experience } = req.body;

    // Check if application already exists
    const existingApplication = await InstructorApplication.findOne({ email });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "An application with this account is already pending",
      });
    }

    // Check if Phone already linked to another account
    const [userPhone, tutorPhone, adminPhone] = await Promise.all([
      User.findOne({ phone }),
      Tutor.findOne({ phone }),
      Admin.findOne({ phone }),
    ]);

    const phoneExists = !!(userPhone || tutorPhone || adminPhone);

    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already linked with an account",
      });
    }

    // Prepare credentials
    const credentials = req.files?.certificates
      ? req.files.certificates.map((file) => ({
          certificate: file.path,
          mimeType: file.mimetype,
        }))
      : [];

    // Create new application
    const newApplication = new InstructorApplication({
      fullName,
      email,
      phone,
      field,
      experience: experience || "",
      credentials,
    });

    // Save the application
    await newApplication.save();

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Instructor application submitted successfully",
      applicationId: newApplication._id,
    });
  } catch (error) {
    // Log the full error for server-side debugging
    console.error("Submit Application Error:", error);

    // Send a clear error response
    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: error.toString(),
    });
  }
};

const getInstructorApplications = async (req, res) => {
  try {
    const applications = await InstructorApplication.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

const getCertificates = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find the application containing the certificate
    const application = await InstructorApplication.findOne({
      "credentials._id": new mongoose.Types.ObjectId(certificateId),
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Find the specific certificate
    const certificate = application.credentials.find(
      (cert) => cert._id.toString() === certificateId
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Specific certificate not found",
      });
    }

    // Construct full file path
    const filePath = path.resolve(certificate.certificate);

    // Check if file exists
    try {
      await fsp.access(filePath);
    } catch (accessError) {
      return res.status(404).json({
        success: false,
        message: "Certificate file not accessible",
      });
    }

    // Get file stats and extension
    const stats = await fsp.stat(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    // Map file extensions to MIME types
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };

    const contentType = mimeTypes[fileExtension] || "application/octet-stream";

    // Set appropriate headers
    res.set({
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Content-Disposition": "inline",
    });

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (streamError) => {
      console.error("Stream error:", streamError);
      // Only send error if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming the file",
        });
      }
    });
  } catch (error) {
    console.error("Certificate Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving certificate",
      error: error.message,
    });
  }
};

const reviewInstructorApplication = async (req, res) => {
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });

  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });

  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find application
    const application = await InstructorApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Handle approved status
    if (status === "approved") {
      // Check if user already exists
      let existingUser = await User.findOne({ email: application.email });
      const userId = existingUser._id;

      if (existingUser) {
        // Generate a secure random password
        const newPassword = generateDefaultPassword(application.email);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Convert existing user to tutor
        const newTutor = new Tutor({
          ...existingUser.toObject(),
          _id: new ObjectId(),
          email: application.email,
          fullName: application.fullName,
          password: hashedPassword,
          phone: application.phone,
          credentials: application.credentials.map((cred) => ({
            certificate: cred.certificate,
            experience: cred.description,
          })),
        });
        await newTutor.save();

        //blacklist userId for invalidating currenlty logged in user
        await Blacklist.findOneAndUpdate(
          { userId },
          { invalidatedAt: new Date() },
          { upsert: true }
        );

        console.log("User blacklisted  successfully");

        // Delete data from user collection
        await User.findByIdAndDelete(existingUser._id);

        // Send approval email with new password
        try {
          const { subject, htmlContent } = tutorApprovedEmailTemplate(
            newTutor.fullName,
            newPassword
          );

          await mailSender(application.email, subject, htmlContent);
        } catch (error) {
          console.error("Failed to send approval email", {
            tutorId: newTutor._id,
            error: error.message,
          });
        }

        // Delete the application
        await InstructorApplication.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          message: "Tutor approved successfully",
          tutor: newTutor,
        });
      }
    }

    // Handle rejected status
    else if (status === "rejected") {
      // Delete the application if rejected
      await InstructorApplication.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Application rejected",
      });
    }

    // If status is neither approved nor rejected
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  } catch (error) {
    // Comprehensive error handling
    console.error("Review Application Error", {
      errorMessage: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Error reviewing application",
      error: error.message,
    });
  }
};

const existsCheck = async (req, res) => {
  try {
    const { email, username, phone, userId } = req.body;

    let emailExists = false;
    let userNameExists = false;
    let phoneExists = false;

    // Helper function to check existence while excluding current user
    const checkExistence = async (Model, field, value) => {
      if (!value) return false;

      const query = { [field]: value };

      // If currentUserId is provided, exclude the current user's document
      if (userId) {
        query._id = { $ne: userId };
      }

      const existingDoc = await Model.findOne(query);
      return !!existingDoc;
    };

    // Comprehensive check for username and phone
    if (username) {
      userNameExists = await Promise.all([
        checkExistence(User, "userName", username),
        checkExistence(Tutor, "userName", username),
        checkExistence(Admin, "userName", username),
      ]).then((results) => results.some((result) => result));
    }

    if (phone) {
      phoneExists = await Promise.all([
        checkExistence(User, "phone", phone),
        checkExistence(Tutor, "phone", phone),
        checkExistence(Admin, "phone", phone),
      ]).then((results) => results.some((result) => result));
    }

    if (email) {
      emailExists = await Promise.all([
        checkExistence(User, "email", email),
        checkExistence(Tutor, "email", email),
        checkExistence(Admin, "email", email),
      ]).then((results) => results.some((result) => result));
    }

    let message = "No conflicts found";
    if (userNameExists) message = "Username is already in use";
    else if (phoneExists) message = "Phone is already in use";
    else if (emailExists) message = "Email already in use";

    return res.json({
      emailExists,
      userNameExists,
      phoneExists,
      message,
    });
  } catch (error) {
    console.error("Uniqueness check error:", error);
    return res.status(500).json({
      message: "Server error checking uniqueness",
      error: error.message,
    });
  }
};

const approveTutor = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    // Find the application by ID and update its status
    const updatedApplication = await InstructorApplication.findByIdAndUpdate(
      applicationId,
      {
        status: status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Check if application exists
    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Tutor application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tutor application processed",
      status: status,
    });
  } catch (error) {
    console.error("Error approving tutor application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const listUser = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(403)
        .json({ message: "Token is invalid! Please refresh or login again." });
    if (req.user?.type !== "admin")
      return res.status(403).json({
        message: "You dont have authorization to perform this action!",
      });
    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
      { _id: id },
      { isActive: true },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      res.status(200).json({ success: true, message: "User is listed" });
    }
  } catch (error) {
    console.log("Server error", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlistUser = async (req, res) => {
  try {
    console.log("jwt decoded", req.user);
    if (!req.user)
      return res
        .status(403)
        .json({ message: "Token is invalid! Please refresh or login again." });
    if (req.user?.type !== "admin")
      return res.status(403).json({
        message: "You dont have authorization to perform this action!",
      });

    const id = req.params.id;

    const user = await User.findByIdAndUpdate(
      { _id: id },
      { isActive: false },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      res.status(200).json({ success: true, message: "User is unlisted" });
    }
  } catch (error) {
    console.log("Server error", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const lisTtutor = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(403)
        .json({ message: "Token is invalid! Please refresh or login again." });
    if (req.user?.type !== "admin")
      return res.status(403).json({
        message: "You dont have authorization to perform this action!",
      });
    const id = req.params.id;

    const user = await Tutor.findByIdAndUpdate(
      { _id: id },
      { isActive: true },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: "Tutor not found" });
    } else {
      res.status(200).json({ success: true, message: "Tutor is listed" });
    }
  } catch (error) {
    console.log("Server error", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlisTtutor = async (req, res) => {
  try {
    if (!req.user)
      return res
        .status(403)
        .json({ message: "Token is invalid! Please refresh or login again." });
    if (req.user?.type !== "admin")
      return res.status(403).json({
        message: "You dont have authorization to perform this action!",
      });
    const id = req.params.id;
    const user = await Tutor.findByIdAndUpdate(
      { _id: id },
      { isActive: false },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ success: false, message: "Tutor not found" });
    } else {
      res.status(200).json({ success: true, message: "Tutor is unlisted" });
    }
  } catch (error) {
    console.log("Server error", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const addCategory = async (req, res) => {
  const { title, description } = req.body;

  console.log(req.user);

  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });
  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  try {
    const category = new Category({ title, description });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

const updateCategory = async (req, res) => {
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });
  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });

  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });
  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

const listCourse = async (req, res) => {
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });
  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Course ID is missing or inappropriate" });
  }

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      { isListed: true },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course listed successfully", course });
  } catch (error) {
    console.error("Error listing course:", error);
    res.status(500).json({ message: "Failed to list course" });
  }
};

const unlistCourse = async (req, res) => {
  if (!req.user)
    return res
      .status(403)
      .json({ message: "Token is invalid! Please refresh or login again." });
  if (req.user?.type !== "admin")
    return res
      .status(403)
      .json({ message: "You dont have authorization to perform this action!" });
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Course ID is missing or not in proper format" });
  }

  try {
    const course = await Course.findByIdAndUpdate(
      id,
      { isListed: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course unlisted successfully", course });
  } catch (error) {
    console.error("Error listing course:", error);
    res.status(500).json({ message: "Failed to unlist course" });
  }
};

const openReport = async (req, res) => {
  try {
    const { title, description, type, targetType, targetId, reportedBy } =
      req.body;

    if (!["Course", "Tutor"].includes(targetType)) {
      return res.status(400).json({ error: "Invalid target type" });
    }

    const existingReport = await Report.findOne({ reportedBy, targetId });

    if (existingReport)
      return res.status(409).json({
        message: "You already have a report in review! Please be patient",
      });

    const newReport = new Report({
      title,
      description,
      type,
      targetType,
      targetId,
      reportedBy,
    });

    const report = await newReport.save();

    res.status(200).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({ path: "reportedBy", select: "fullName _id" })
      .sort({ createdAt: -1 });

    const repopulatedReports = await Promise.all(
      reports.map((report) => {
        // Check if targetId is null before attempting to populate
        if (report.targetId) {
          return report.populate({
            path: "targetId",
            select: report.targetType === "Course" ? "title" : "fullName",
          });
        } else {
          // Return the report as is if targetId is null
          return report;
        }
      })
    );

    console.log(repopulatedReports);

    res
      .status(200)
      .json({ message: "Reports fetched successfully", repopulatedReports });
  } catch (error) {
    console.log("Error fetching reports", error);
    res
      .status(500)
      .json({ message: "Internal server error , Failed to get reports" });
  }
};

const handleReportStatus = async (req, res) => {
  const { reportId, status } = req.body;

  console.log("asdasdasd", req.body);

  try {
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    console.log(report);

    const updatedReport = await Report.findByIdAndUpdate(reportId, { status });
    await updatedReport.save();

    res.status(200).json({ message: "Updated report status successfully" });
  } catch (error) {
    console.log("Error updating report status", error);
    res.status(500).json({ message: "Error updating report status" });
  }
};

const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("order ID", orderId);

    const invoicePath = await generateInvoice(orderId);

    console.log("path to download invoice", invoicePath);

    // Send the PDF file as a download response
    res.download(invoicePath, `invoice_${orderId}.pdf`, (err) => {
      if (err) {
        console.error("Error sending invoice file:", err);
        res.status(500).json({ message: "Error generating invoice" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice", error });
  }
};

const sendNotification = async (req, res) => {
  const { userId, actionTaken } = req.body;

  if (!userId || !actionTaken) {
    return res.status(400).json({ message: "Credentials needed are missing" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = {
      _id: new ObjectId(),
      type: "ReportAction",
      title: "Report Review Update",
      content: actionTaken,
      isRead: false,
      createdAt: new Date(),
    };

    user.notifications.push(notification);
    await user.save();

    // Get the io instance and emit
    const io = getIO();

    console.log("Active socket rooms:", io.sockets.adapter.rooms);

    io.to(userId).emit("newNotification", notification);

    console.log("emitted notification", userId, notification);

    res
      .status(200)
      .send({ message: "Notification sent successfully", notification });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Failed to send notification", details: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    return res
      .status(200)
      .json({ message: "Coupons fetched successfully", coupons });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      usageLimit,
      validTill,
      isActive,
    } = req.body;

    console.log(req.body);

    if (!code || !validTill || !discountType || !discountValue)
      return res
        .status(400)
        .json({ message: "Some data recieved is missing or invalid" });

    const coupon = await Coupon.findOne({ code });
    if (coupon)
      return res
        .status(409)
        .json("Coupon with same coupon code already exists!");

    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      validTill,
      isActive,
      usageLimit,
    });

    await newCoupon.save();

    return res.status(200).json({ message: "Coupon created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!couponId)
      return res.status(400).json({ Mesage: "CouponId is missing" });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).jsn({ message: "Coupon not found" });

    coupon.isActive = !coupon.isActive;

    await coupon.save();

    return res
      .status(200)
      .json({ message: "Succesfully changed coupon status" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!couponId)
      return res.status(400).json({ message: "couponId not recieved" });

    const coupon = await Coupon.findByIdAndDelete(couponId);

    return res.status(200).json({ message: "Coupons deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPayoutRequests = async (req, res) => {
  try {
    const payoutRequests = await Payouts.find()
      .populate("tutorId", "fullName profileImg email")
      .sort({ requestedAt: -1 });

    return res.status(200).json({
      message: "Payout requests fetched successfully",
      payoutRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handlePayoutRequest = async (req, res) => {
  try {
    const { type } = req.user;
    if (type !== "admin")
      return res
        .status(401)
        .json({ message: "You are unauthorized to perform this action" });

    const { action, requestId } = req.body;

    if (!action || !requestId) {
      return res
        .status(400)
        .json({ message: "Payload data is missing/incorrect" });
    }

    const payoutRequest = await Payouts.findById(requestId);
    if (!payoutRequest) {
      return res.status(404).json({ message: "Payout request not found" });
    }

    const tutor = await Tutor.findById(payoutRequest.tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    if (action === "approve") {
      payoutRequest.status = "approved";
    } else if (action === "reject") {
      payoutRequest.status = "rejected";

      // Convert `amountWithdrawn` to a number, subtract, and validate
      const currentAmount = parseFloat(tutor.amountWithdrawn.toString());
      const newAmount = currentAmount - payoutRequest.amount;

      if (newAmount < 0) {
        return res
          .status(400)
          .json({ message: "Invalid operation: Amount cannot be negative" });
      }

      tutor.amountWithdrawn = newAmount;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    payoutRequest.processedAt = new Date();
    await payoutRequest.save();
    await tutor.save();

    res.status(200).json({
      message: `Payout request ${action.toLowerCase()} successfully`,
      payoutRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ "timestamps.createdAt": -1 })
      .populate("userId", "fullName profileImg email")
      .populate({
        path: "courses",
        select: "categoryId price",
        populate: {
          path: "categoryId",
          select: "title",
        },
      });

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log("Request query:", req.query);

    const reportPath = await generateSalesReport(startDate, endDate);

    console.log("Report path:", reportPath);

    // Verify file exists before sending
    if (!fs.existsSync(reportPath)) {
      console.error("File not found:", reportPath);
      return res.status(404).json({ message: "Report file not found" });
    }

    // Send the PDF file as a download response
    res.download(
      reportPath,
      `sales_report_${startDate}_to_${endDate}.pdf`,
      (err) => {
        if (err) {
          console.error("Error sending report file:", err);
          res.status(500).json({ message: "Error sending report file" });
        } else {
          console.log("Report file sent successfully:", reportPath);
        }
      }
    );
  } catch (error) {
    console.error("Error in getSalesReport:", error);
    res.status(500).json({ message: "Error generating sales report", error });
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
  logoutAdmin,
  getUsers,
  listUser,
  unlistUser,
  lisTtutor,
  unlisTtutor,
  submitInstructorApplication,
  getInstructorApplications,
  reviewInstructorApplication,
  getTutors,
  getCertificates,
  approveTutor,
  existsCheck,
  getCategories,
  addCategory,
  getOrders,
  updateCategory,
  deleteCategory,
  listCourse,
  unlistCourse,
  openReport,
  getReports,
  sendNotification,
  handleReportStatus,
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getPayoutRequests,
  handlePayoutRequest,
  getInvoice,
  getSalesReport,
};
