 const express = require("express");
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin=require('../model/adminModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpSchema = require('../model/otpStore');
const otpGenerator = require("otp-generator");
const crypto = require('crypto');
const { mailSender, otpEmailTemplate } = require('../utils/nodeMailer');
const genarateAccesTocken = require("../utils/genarateAccesTocken");
const genarateRefreshTocken = require("../utils/genarateRefreshTocken");
const { oauth2client } = require("../config/googleConfig");
const axios =require('axios');





const sendOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = Math.floor(100000 + Math.random() * 900000);
        
        // Delete any existing OTP
        await otpSchema.deleteOne({ email });
        
        // Save new OTP
        const otpDoc = await otpSchema.create({
            email,
            otp: otp.toString()
        });
        
        console.log("Generated OTP:", otp);
        console.log("Saved OTP document:", otpDoc);
        
        const { subject, htmlContent } = otpEmailTemplate(otp);
        const info = await mailSender(email, subject, htmlContent);
        
        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (err) {
        console.error("Error in sendOtp:", err);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });
    }
};

const signUp = async (req, res) => {

  const securePassword = async (password) => bcrypt.hash(password, 10);

  try {
      const { userName, fullName, password, email, phone } = req.body;
      
      // Check if user exists in BOTH User and Tutor collections
      const userExists = await User.findOne({ email });
      const tutorExists = await Tutor.findOne({ email });
      
      if (userExists || tutorExists) {
          return res.status(409).json({ 
              message: "User already exists", 
              existsAs: userExists ? "user" : "tutor" 
          });
      }
      
      const passwordHash = await securePassword(password);
      
      const newUser = await User.create({
          userName,      
          fullName,    
          password: passwordHash,
          email,
          phone,
          
      });
     
      res.status(200).json({ 
          message: "User is registered", 
          userData: newUser 
      });
  } catch (error) {
      console.error("Error in signUp:", error);
      res.status(500).json({ 
          message: "Server error", 
          error: error.message 
      });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the account by email (User, Tutor, Admin)
    const user = await User.findOne({ email });
    const tutor = await Tutor.findOne({ email });
    const admin = await Admin.findOne({ email });

  

    // Determine the account type
    const accountToAuthenticate = user || tutor || admin;

   

    // If no account is found
    if (!accountToAuthenticate) {
      return res.status(404).json({ message: "Account not found. Please check your credentials." });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(password, accountToAuthenticate.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const userId = accountToAuthenticate._id;
    const userType = admin ? "admin" : (user ? "user" : "tutor");

    try {
      genarateAccesTocken(res, userId);
      genarateRefreshTocken(res, userId);

      // Respond with success
      res.status(200).json({
        message: "Login successful",
        userData: accountToAuthenticate,
        userType: userType,
        redirectUrl: admin
          ? "/admin/dashboard"
          : user
          ? "/"
          : "/tutor/dashboard",
      });
    } catch (tokenError) {
      console.error("Error generating tokens:", tokenError);
      res.status(500).json({ message: "Error generating tokens. Please try again later." });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};


const googleLogin = async (req, res, next) => {
    try {
      // Get code from request body instead of query params
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code is required'
        });
      }
  
      const { tokens } = await oauth2client.getToken(code);
      oauth2client.setCredentials(tokens);
  
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`
          }
        }
      );
  
      const {
        email,
        name: fullName,
        picture: profileImg,
      } = userInfo.data;
  
      // Check if user exists
      let user = await User.findOne({ email });
  
      if (!user) {
        // Generate a unique username based on email
        const baseUsername = email.split('@')[0];
        let userName = baseUsername;
        let counter = 1;
  
        // Keep checking until we find a unique username
        while (await User.findOne({ userName })) {
          userName = `${baseUsername}${counter}`;
          counter++;
        }
  
        // Generate a random secure password for OAuth users
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
        // Create new user
        user = await User.create({
          fullName,
          userName,
          email,
          password: hashedPassword,
          profileImg: profileImg || '',
          isVerified: true,
          isActive: true,
          phone: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing user's details
        user.profileImg = profileImg || user.profileImg;
        user.updatedAt = new Date();
        await user.save();
      }
  
      // Generate tokens
      genarateAccesTocken(res, user._id);
      genarateRefreshTocken(res, user._id);
  
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: {
            _id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            profileImg: user.profileImg,
            isVerified: user.isVerified,
            isActive: user.isActive
          }
        }
      });
  
    } catch (error) {
      console.error('Google authentication error:', error);
  
      // Handle specific errors
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
  
      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Google token'
        });
      }
  
      // Default error response
      return res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: error.message
      });
    }
  };



const updateUser = async (req, res) => {
    try {
        const { _id, email, name, phone, profileImage } = req.body;
        console.log('Received update request:', { _id, email, name, phone, profileImage });

        const user = await User.findById(_id);
        if (!user) {
            console.log('User not found:', _id);
            return res.status(404).json({ message: "User not found" });
        }

        const updatedData = { 
            ...(name && { name }), 
            ...(email && { email }), 
            ...(phone && { phone }),
            ...(profileImage && { profileImage })
        };
        console.log('Updating user with data:', updatedData);

        const updatedUser = await User.findByIdAndUpdate(_id, updatedData, { new: true });
        console.log('Updated user:', updatedUser);
        
        res.json({ message: "Update successful", updatedUser });
    } catch (error) {
        console.error("Error in updateUser:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken')
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { googleLogin, signUp, login, updateUser, logoutUser,  sendOtp };
