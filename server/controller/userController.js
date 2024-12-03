
const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin=require('../model/adminModel');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const otpSchema = require('../model/otpStore');
const crypto = require('crypto');
const { mailSender, otpEmailTemplate } = require('../utils/nodeMailer');
const genarateAccessToken = require("../utils/genarateAccesToken");
const genarateRefreshToken = require("../utils/genarateRefreshToken");
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
      
      
    const [userExists,tutorExists,adminExists]=await Promise.all([
      User.findOne({email}),
      Tutor.findOne({email}),
      Admin.findOne({email})
    ])
      
      if (userExists || tutorExists || adminExists) {
          return res.status(409).json({ 
              message: "User already exists", 
              existsAs: adminExists?"admin":( userExists ? "user" : "tutor" )
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
 const [user,tutor,admin]=await Promise.all([
  User.findOne({email}),
  Tutor.findOne({email}),
  Admin.findOne({email})
 ])

  

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

    // Debugging cookie setting
    console.log("Before Token Generation - Response Headers:", res.getHeaders());

    try {
      genarateAccessToken(res, userId, userType);
      genarateRefreshToken(res,userId, userType);

      console.log("After Token Generation - Response Headers:", res.getHeaders());   

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
    const [user,admin,tutor]=await Promise.all([
      User.findOne({email}),
      Admin.findOne({email}),
      Tutor.findOne({email}),
    ])

      const currentUser= user|| admin || tutor;
      const accType = admin ? "admin" : (tutor ? "tutor" : "user");
  

  
      if (!currentUser) {
        const baseUsername = email.split('@')[0];
        let userName = baseUsername;
        let counter = 1;
      
        while (await User.findOne({ userName })) {
          userName = `${baseUsername}${counter}`;
          counter++;
        }
      
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
        currentUser = await User.create({
          fullName,
          userName,
          email,
          password: hashedPassword,
          profileImg: profileImg || '',
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
       else  {
        // Update existing user's details
        currentUser.profileImg = profileImg || currentUser.profileImg;
        currentUser.updatedAt = new Date();
        await currentUser.save();
      }
     
      // Debugging cookie setting
    console.log("Before Token Generation - Response Headers:", res.getHeaders());

      // Generate tokens
      genarateAccessToken(res, currentUser._id,accType);
      genarateRefreshToken(res, currentUser._id,accType);
  
// Debugging cookie setting
console.log("After Token Generation - Response Headers:", res.getHeaders());

      const responseData = {
        _id: currentUser._id,
        fullName: currentUser.fullName,
        userName:currentUser.userName,
        email: currentUser.email,
        profileImg: currentUser.profileImg,
        accType,
      };
      
      if (accType === "user" || accType === "tutor") {
        responseData.isVerified = currentUser.isVerified;
        responseData.isActive = currentUser.isActive;
      }


      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: responseData
          
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

 const changePassword = async (req, res) => {
    const { currentPassword, newPassword, email } = req.body;
  
  
    console.log('Cookies:', req.cookies); // This should print accessToken and refreshToken
    
    try {
      // Find user by email
      const user = await User.findOne({email});
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if the current password matches the stored hashed password
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Current password is Incorrect" });
      }

      if(currentPassword===newPassword){
        return res.status(409).json({message:"New Password cannot be same as Current Password"})
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password in the database
      user.password = hashedNewPassword;
      await user.save();
  
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
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

module.exports = { googleLogin, signUp, login, updateUser, logoutUser,  sendOtp ,changePassword};
