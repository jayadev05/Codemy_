
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin = require("../model/adminModel");
const InstructorApplication = require("../model/tutorApplication");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const fsp = fs.promises; // For promise-based methods
const { mailSender,tutorApprovedEmailTemplate, passwordResetTemplate } = require('../utils/nodeMailer');
const generateDefaultPassword=require('../utils/generateDefaultPasswordd');
const generateUniqueUsername=require("../utils/generateUniqueUserName");
require("dotenv").config();



// Controllers


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Input validation
  if (!email) {
    return res.status(400).json({ 
      message: 'Email is required',
      type: 'error'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Invalid email format',
      type: 'error'
    });
  }

  try {
    // Normalize email for consistent searching
    const normalizedEmail = email.trim().toLowerCase();

    const [user,admin,tutor]= await Promise.all([
      User.findOne({email:normalizedEmail}),
       Admin.findOne({email:normalizedEmail}),
      Tutor.findOne({email:normalizedEmail}),
    ])
   

    const currentUser = user || tutor || admin;

    // If no user found, return a generic success-like response
    if (!currentUser) {
      return res.status(200).json({ 
        message: 'If an account exists, a reset link will be sent',
        type: 'success'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Update user with reset token and expiration
    currentUser.resetPasswordToken = resetToken;
    currentUser.resetPasswordExpires = Date.now() + 900000; // 15 mins

    await currentUser.save();

    // Create reset URL
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      // Attempt to send reset email
      const { subject, htmlContent } = passwordResetTemplate(resetURL);
      
      await mailSender(normalizedEmail, subject, htmlContent);

      // Successful email send
      return res.status(200).json({ 
        message: 'Password reset link has been sent to your email',
        type: 'success'
      });
    } catch (emailError) {
      // Comprehensive email sending error handling
      console.error('Email sending failed:', emailError);

      // Clear reset token on email failure
      currentUser.resetPasswordToken = undefined;
      currentUser.resetPasswordExpires = undefined;
      await currentUser.save();

      return res.status(500).json({ 
        message: 'Unable to send password reset email. Please try again later.',
        type: 'error',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    // Comprehensive server-side error handling
    console.error('Forgot password error:', error);

    return res.status(500).json({ 
      message: 'An unexpected error occurred. Please try again.',
      type: 'error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {

    const [user,tutor,admin]=await Promise.all([
      User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      }),
      Tutor.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      }),
      Admin.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      })
    ])
   
    const currentUser= user || tutor || admin;



    if (!currentUser) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    currentUser.password = encryptedPassword;
    currentUser.resetPasswordToken = undefined;
    currentUser.resetPasswordExpires = undefined;

    await currentUser.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getUsers = async(req, res) => {
  
  try {
    const students = await User.find();
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
      query.status = status === 'active';
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

const getCertificates = async (req, res) => {
  try {
    const { certificateId } = req.params;

    console.log('Requested Certificate ID:', certificateId); // Add detailed logging

    // Find the application containing the certificate
    const application = await InstructorApplication.findOne({
      'credentials._id': new mongoose.Types.ObjectId(certificateId),
    });

    if (!application) {
      console.error('No application found for certificateId:', certificateId);
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Find the specific certificate
    const certificate = application.credentials.find(
      (cert) => cert._id.toString() === certificateId
    );

    if (!certificate) {
      console.error('No certificate found in application:', certificateId);
      return res.status(404).json({
        success: false,
        message: 'Specific certificate not found',
      });
    }

    // Construct full file path
    const filePath = path.resolve(certificate.certificate);
    console.log('Resolved File Path:', filePath);

    // Use fs.promises.access for file existence check
    try {
      await fsp.access(filePath);
    } catch (accessError) {
      console.error('File access error:', accessError);
      return res.status(404).json({
        success: false,
        message: 'Certificate file not accessible',
        error: accessError.message,
      });
    }

    // Get file stats
    const stats = await fsp.stat(filePath);
    const fileExtension = path.extname(filePath).toLowerCase().slice(1);

    res.set({
      'Content-Type': `image/${fileExtension}`,
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=86400',
    });

    // Stream the file for efficiency
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (streamError) => {
      console.error('Error while streaming the file:', streamError);
      res.status(500).json({
        success: false,
        message: 'Error streaming the file',
      });
    });
  } catch (error) {
    console.error('Certificate Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving certificate',
      error: error.message,
    });
  }
};

const reviewInstructorApplication = async (req, res) => {
  try {
      const { id } = req.params;
      const { status } = req.body;

      // Secure password hashing function
      const securePassword = async (password) => bcrypt.hash(password, 10);

      // Find application
      const application = await InstructorApplication.findById(id);
      if (!application) {
          return res.status(404).json({
              success: false,
              message: 'Application not found'
          });
      }

      // Handle approved status
      if (status === 'approved') {
          // Check if user already exists
          let existingUser = await User.findOne({ email: application.email });

          if (existingUser) {
              // Convert existing user to tutor if user exists
              const newTutor = new Tutor({
                  ...existingUser.toObject(),
                  phone:application.phone,
                  credentials: application.credentials.map(cred => ({
                      certificate: cred.certificate,
                      experience: cred.description
                  }))
              });

              await newTutor.save();

              //Delete data from user collection
              await User.findByIdAndDelete(existingUser._id);

              // Delete the application
              const deleteResult = await InstructorApplication.findByIdAndDelete(id);

              return res.status(200).json({
                  success: true,
                  message: 'Tutor approved successfully',
                  tutor: newTutor
              });
          } else {
              // Create new tutor if user doesn't exist
              const uniqueUserName = await generateUniqueUsername(application.email);
              const defaultPassword = generateDefaultPassword(application.email);
              const hashedPassword = await securePassword(defaultPassword);

              const newTutor = new Tutor({
                  fullName: application.fullName,
                  email: application.email,
                  userName: uniqueUserName,
                  password: hashedPassword,
                  phone:application.phone,
                  credentials: application.credentials.map(cred => ({
                      certificate: cred.certificate,
                      experience: cred.description
                  })),
                  isActive: true,
              });

              await newTutor.save();

              // Send approval email
              const { email, fullName } = newTutor;
              const { subject, htmlContent } = tutorApprovedEmailTemplate(fullName, defaultPassword);
              
              try {
                  await mailSender(email, subject, htmlContent);
              } catch (error) {
                  console.log("Error sending mail:", error);
              }

              // Delete the application
              const deleteResult = await InstructorApplication.findByIdAndDelete(id);
              

              return res.status(200).json({
                  success: true,
                  message: 'Tutor approved successfully',
                  tutor: newTutor
              });
          }
      } 
      // Handle rejected status
      else if (status === 'rejected') {
          // Delete the application if rejected
          const deleteResult = await InstructorApplication.findByIdAndDelete(id);
          

          return res.status(200).json({
              success: true,
              message: 'Application rejected'
          });
      }

      // If status is neither approved nor rejected
      return res.status(400).json({
          success: false,
          message: 'Invalid status'
      });

  } catch (error) {
      // Error handling
      console.error('Review Application Error:', error);
      res.status(500).json({
          success: false,
          message: 'Error reviewing application',
          error: error.message
      });
  }
};

const checkMailExists = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    // Use Promise.all for concurrent database queries
    const [existingUser, existingTutor, existingAdmin] = await Promise.all([
      User.findOne({ email }),
      Tutor.findOne({ email }),
      Admin.findOne({ email })
    ]);

    // Determine if user exists in any collection
    const currentUser = existingAdmin || existingTutor || existingUser;

    // Return response
    return res.json({
      exists: !!currentUser,
      message: currentUser ? 'User already exists' : 'User does not exist'
    });

  } catch (error) {
    console.error('Email check error:', error);
    return res.status(500).json({ message: 'Server error checking email' });
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
        updatedAt: new Date() 
      }, 
      { new: true } // Returns the updated document
    );

    // Check if application exists
    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: 'Tutor application not found'
      });
    }

    // Call the review endpoint
    try {
      const result = await axios.put(
        `http://localhost:3000/admin/instructor-applications/${applicationId}/review`, 
        { status } // Send status in request body
      );

      // If review is successful, return the newly created tutor (if any)
      if (result.data.tutor) {
        return res.status(200).json({
          success: true,
          message: 'Tutor application approved successfully',
          tutor: result.data.tutor
        });
      }
    } catch (err) {
      console.log("Error in application review", err.response?.data || err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Tutor application processed'
    });
  } catch (error) {
    console.error('Error approving tutor application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
   
    const user = await Tutor.findByIdAndUpdate({_id: id}, {isActive: true}, {new: true});
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
    const user = await Tutor.findByIdAndUpdate({_id: id}, {isActive:false}, {new: true});
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
  checkMailExists
};