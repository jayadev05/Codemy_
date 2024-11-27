const express = require("express");
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const InstructorApplication = require("../model/tutorApplication");
const mongoose = require('mongoose');
const Category = require('../model/categoryModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { mailSender } = require('../utils/nodeMailer');
const generateAccessToken = require('../utils/genarateAccesTocken');
const generateRefreshToken = require("../utils/genarateRefreshTocken");
require("dotenv").config();

const passwordResetTemplate = (resetURL) => {
  return {
    subject: "Password Reset Request",
    htmlContent: `
      <h1>Password Reset Request</h1>
      <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Please click on the following link, or paste this into your browser to complete the process:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `
  };
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    if(user?.role === "admin"){
      const resetToken = crypto.randomBytes(20).toString('hex');

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; 

      await user.save();

      const resetURL = `http://localhost:5173/admin/reset-password/${resetToken}`;

      const { subject, htmlContent } = passwordResetTemplate(resetURL);
      await mailSender(email, subject, htmlContent);

      res.status(200).json({ message: 'Password reset link sent' });
    } else {
      res.status(403).json({ message: 'Not authorized for password reset' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}; 

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    user.password = encryptedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminInfo = await User.findOne({ email });

    if (adminInfo?.role === "admin") {
      if (await bcrypt.compare(password, adminInfo.password)) {
        generateAccessToken(res, adminInfo._id);
        generateRefreshToken(res, adminInfo._id);

        return res.status(200).json({
          message: "Login successful",
          adminData: adminInfo,
        });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } else {
      res.status(401).json({ message: "No access" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const students = async(req, res) => {
  try {
    const students = await User.find({role: "student"});
    console.log(students);
    if(!students) {
      return res.status(404).json({message: "No students found"});
    }
    return res.status(200).json({message: "Students data fetched successfully", students});
  } catch(error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const tutors = async(req, res) => {
  try {
    const tutors = await User.find({role: "tutor"});
    console.log(tutors);
    if(!tutors) {
      return res.status(404).json({message: "No tutors found"});
    }
    return res.status(200).json({message: "Tutors data fetched successfully", tutors});
  } catch(error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logoutAdmin = async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const getTutors = async(req,res)=>{
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search 
    } = req.query;

    // Build query
    let query = {};
    if (status !== undefined) {
      query.status = status === 'true';
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch tutors
    const tutors = await Tutor.find(query)
      .select('-__v') // Exclude version key
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Count total documents
    const total = await Tutor.countDocuments(query);

    res.json({
      success: true,
      totalTutors: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      tutors
    });
  } catch (error) {
    console.error('Get Tutors Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tutors',
      error: error.message 
    });
  }
}

const submitInstructorApplication = async (req, res) => {
  try {
    // Log incoming request details for debugging
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const {
      fullName,
      email,
      phone,
      experience
    } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Check if application already exists
    const existingApplication = await InstructorApplication.findOne({ email });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists'
      });
    }

    // Prepare credentials
    const credentials = req.files?.certificates
      ? req.files.certificates.map(file => ({
          certificate: file.path,
          description: experience || ''
        }))
      : [];

    // Create new application
    const newApplication = new InstructorApplication({
      fullName,
      email,
      phone,
      experience: experience || '',
      credentials
    });

    // Save the application
    await newApplication.save();

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Instructor application submitted successfully',
      applicationId: newApplication._id
    });
  } catch (error) {
    // Log the full error for server-side debugging
    console.error('Submit Application Error:', error);

    // Send a clear error response
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.toString()
    });
  }
};

const getInstructorApplications= async(req,res)=>{ 
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'pending' 
    } = req.query;

    const query = { status };

    const applications = await InstructorApplication.find(query)
      .select('-__v')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await InstructorApplication.countDocuments(query);

    res.json({
      success: true,
      totalApplications: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      applications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications',
      error: error.message 
    });
  }
  
}

const reviewInstructorApplication = async (req, res) => { 
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id } = req.params;
    const { 
      status, 
      reviewNotes, 
      adminId 
    } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Find and update application
    const application = await InstructorApplication.findById(id);
    if (!application) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    // Update application status
    application.status = status;
    application.reviewedBy = adminId;
    application.reviewNotes = reviewNotes || '';

    // If approved, create tutor
    if (status === 'approved') {
      const newTutor = new Tutor({
        fullName: application.fullName,
        email: application.email,
        userName: application.email.split('@')[0],
        credentials: application.credentials.map(cred => ({
          certificate: cred.certificate,
          experience: cred.description
        })),
        // Optional: You might want to add more fields or defaults
      });

      await newTutor.save({ session });
    }

    // Save updated application
    await application.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: `Application ${status}`,
      applicationId: id
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Review Application Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reviewing application',
      error: error.message 
    });
  }
};

const listUser = async(req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: true}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "User not found"});
    } else {
      res.status(200).json({success: true, message: "User is listed"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlistUser = async(req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: false}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "User not found"});
    } else {
      res.status(200).json({success: true, message: "User is unlisted"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const lisTtutor = async(req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: true}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "Tutor not found"});
    } else {
      res.status(200).json({success: true, message: "Tutor is listed"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const unlisTtutor = async(req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate({_id: id}, {isActive: false}, {new: true});
    if(!user) {
      res.status(404).json({success: false, message: "Tutor not found"});
    } else {
      res.status(200).json({success: true, message: "Tutor is unlisted"});
    }
  } catch(error) {
    console.log("Server error", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const addCategory = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const category = new Category({ title, description });
    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log("This is the category request coming ", categories);
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }                             
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(id, { title, description }, { new: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
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

const refreshAdminToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ message: "Token refreshed successfully" });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};

module.exports = {
  adminLogin,
  forgotPassword,
  resetPassword,
  logoutAdmin,
  students,
  tutors,
  listUser,
  unlistUser,
  lisTtutor,
  unlisTtutor,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  refreshAdminToken,
  submitInstructorApplication, 
  getInstructorApplications,
  reviewInstructorApplication,
  getTutors
};