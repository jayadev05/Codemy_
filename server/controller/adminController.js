
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin = require("../model/adminModel");
const Course=require('../model/courseModel')
const InstructorApplication = require("../model/tutorApplication");
const Category = require('../model/categoryModel')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const fsp = fs.promises; // For promise-based methods
const { mailSender,tutorApprovedEmailTemplate, passwordResetTemplate } = require('../utils/nodeMailer');
const generateDefaultPassword=require('../utils/generateDefaultPasswordd');
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

  

  try {
    // Normalize email for consistent searching
    const normalizedEmail = email.trim().toLowerCase();

    let [user,admin,tutor]= await Promise.all([
      User.findOne({email:normalizedEmail}),
       Admin.findOne({email:normalizedEmail}),
      Tutor.findOne({email:normalizedEmail}),
    ])
   

    let currentUser = user || tutor || admin;

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

    console.log("asdasdasd",currentUser);

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
    const students = await User.find().sort({ createdAt: -1 });
    
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
    

    // Fetch tutors
    const tutors = await Tutor.find().sort({ createdAt: -1 });
     
    res.json({
      success: true,
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

    const {
      fullName,
      email,
      phone,
      field,
      experience
    } = req.body;

    

    // Check if application already exists
    const existingApplication = await InstructorApplication.findOne({ email });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'An application with this account is already pending',
      });
    }

    // Check if Phone already linked to another account
      const[userPhone,tutorPhone,adminPhone]=await Promise.all([
        User.findOne({phone}),
        Tutor.findOne({phone}),
        Admin.findOne({phone}),
      ])

      const phoneExists= !!(userPhone||tutorPhone||adminPhone)


    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: 'Phone number is already linked with an account',
      });
    }

  
    // Prepare credentials
    const credentials = req.files?.certificates
      ? req.files.certificates.map(file => ({
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

    
    const applications = await InstructorApplication.find().sort({ createdAt: -1 });

    res.json({
      success: true,
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
      console.log("recieved status",status);
      
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
              // Generate a secure random password
              const newPassword=generateDefaultPassword(application.email);
              const hashedPassword = await bcrypt.hash(newPassword, 10);

              // Convert existing user to tutor 
              const newTutor = new Tutor({
          ...existingUser.toObject(),
          email:application.email,
          fullName:application.fullName,
          password:hashedPassword,
          phone: application.phone,
          credentials: application.credentials.map((cred) => ({
            certificate: cred.certificate,
            experience: cred.description,
          })),
        });
              await newTutor.save();
              
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
                 
                  toast.error('Failed to send approval email', {
                      tutorId: newTutor._id,
                      error: error.message
                  });
              }
              
              // Delete the application
              await InstructorApplication.findByIdAndDelete(id);
              
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
          await InstructorApplication.findByIdAndDelete(id);
          
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
      // Comprehensive error handling
      console.error('Review Application Error', {
          errorMessage: error.message,
          stack: error.stack
      });
      
      res.status(500).json({
          success: false,
          message: 'Error reviewing application',
          error: error.message
      });
  } 
};

const existsCheck = async (req, res) => {
  try {
      const { email, username, phone,  userId } = req.body;

  

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
              checkExistence(User, 'userName', username),
              checkExistence(Tutor, 'userName', username),
              checkExistence(Admin, 'userName', username)
          ]).then(results => results.some(result => result));
      }

      if (phone) {
          phoneExists = await Promise.all([
              checkExistence(User, 'phone', phone),
              checkExistence(Tutor, 'phone', phone),
              checkExistence(Admin, 'phone', phone)
          ]).then(results => results.some(result => result));
      }

      

      if (email) {
          emailExists = await Promise.all([
              checkExistence(User, 'email', email),
              checkExistence(Tutor, 'email', email),
              checkExistence(Admin, 'email', email)
          ]).then(results => results.some(result => result));
      }

      console.log({
          emailExists,
          userNameExists,
          phoneExists
      });

      let message = 'No conflicts found';
      if (userNameExists) message = 'Username is already in use';
      else if (phoneExists) message = 'Phone is already in use';
      else if (emailExists) message = 'Email already in use';

      return res.json({
          emailExists,
          userNameExists,
          phoneExists,
          message
      });

  } catch (error) {
      console.error('Uniqueness check error:', error);
      return res.status(500).json({ 
          message: 'Server error checking uniqueness',
          error: error.message 
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

  console.log(id,"id");
  console.log(req.body);

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { title, description }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully", updatedCategory });
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

const listCourse = async (req, res) => {
  const { id } = req.params; 

  if (!id) {
    return res.status(400).json({ message: "Course ID is missing or inappropriate" });
  }

  try {
   
    const course = await Course.findByIdAndUpdate(id, { isListed: true }, { new: true });

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
  const { id } = req.params; 
  console.log("course id",id);
  if (!id) {
    return res.status(400).json({ message: "Course ID is missing or not in proper format" });
  }

  try {
    
    const course = await Course.findByIdAndUpdate(id, { isListed: false }, { new: true });

    if (!course) {
      return res.status(404).json({ message: "Course not found" }); 
    }

    res.status(200).json({ message: "Course unlisted successfully", course });

  } catch (error) {
    console.error("Error listing course:", error);
    res.status(500).json({ message: "Failed to unlist course" });
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
  updateCategory,
  deleteCategory,
  listCourse,
  unlistCourse
};