const User = require("../model/userModel");
const Tutor = require("../model/tutorModel");
const Admin = require("../model/adminModel");
const Coupon = require("../model/couponModel");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const otpSchema = require("../model/otpStore");
const crypto = require("crypto");
const { mailSender, otpEmailTemplate } = require("../utils/nodeMailer");
const genarateAccessToken = require("../utils/genarateAccesToken");
const genarateRefreshToken = require("../utils/genarateRefreshToken");
const { oauth2client } = require("../config/googleConfig");
const axios = require("axios");
const { ObjectId } = require("mongoose").Types;

const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Delete any existing OTP
    await otpSchema.deleteOne({ email });

    // Save new OTP
    const otpDoc = await otpSchema.create({
      email,
      otp: otp.toString(),
    });

    const { subject, htmlContent } = otpEmailTemplate(otp);
    const info = await mailSender(email, subject, htmlContent);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Error in sendOtp:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

const signUp = async (req, res) => {
  const securePassword = async (password) => bcrypt.hash(password, 10);

  try {
    const { userName, fullName, password, email, phone } = req.body;

    const [userExists, tutorExists, adminExists] = await Promise.all([
      User.findOne({ email }),
      Tutor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (userExists || tutorExists || adminExists) {
      return res.status(409).json({
        message: "User already exists",
        existsAs: adminExists ? "admin" : userExists ? "user" : "tutor",
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
      userData: newUser,
    });
  } catch (error) {
    console.error("Error in signUp:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the account by email (User, Tutor, Admin)
    const [user, tutor, admin] = await Promise.all([
      User.findOne({ email }),
      Tutor.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    // Determine the account type
    const accountToAuthenticate = user || tutor || admin;

    // If no account is found
    if (!accountToAuthenticate) {
      return res
        .status(404)
        .json({ message: "Account not found. Please check your credentials." });
    }

    // Verify the password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      accountToAuthenticate.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const userId = accountToAuthenticate._id;
    const userType = admin ? "admin" : user ? "user" : "tutor";

    const payload = { id: userId, type: userType };

    
      const accessToken=genarateAccessToken(res, payload);
      const refreshToken = genarateRefreshToken(res, payload);

   
    res.status(200).json({
      message: "Login successful",
      userData: accountToAuthenticate,
      userType: userType,
      accessToken,
      refreshToken,
      redirectUrl: admin
        ? "/admin/dashboard"
        : user
        ? "/"
        : "/tutor/dashboard",
    });
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
        message: "Authorization code is required",
      });
    }

    const { tokens } = await oauth2client.getToken(code);
    oauth2client.setCredentials(tokens);

    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const { email, name: fullName, picture: profileImg } = userInfo.data;

    // Check if user exists
    let [user, admin, tutor] = await Promise.all([
      User.findOne({ email }),
      Admin.findOne({ email }),
      Tutor.findOne({ email }),
    ]);

    let currentUser = user || admin || tutor;
    const accType = admin ? "admin" : tutor ? "tutor" : "user";

    if (!currentUser) {
      // Generate unique username
      const baseUsername = email.split("@")[0];
      let userName = baseUsername;
      let counter = 1;

      // Ensure username is unique
      while (await User.findOne({ userName })) {
        userName = `${baseUsername}${counter}`;
        counter++;
      }

      // Generate secure random password
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      currentUser = await User.create({
        fullName: fullName || "",
        userName,
        email,
        password: hashedPassword,
        profileImg: profileImg || null,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {

      //check if user is blocked

      if( currentUser.isActive && currentUser.isActive===false)return res.status(400).json({message:"User is blocked by admin! Please contact admin"});

      

      if (!profileImg) {
        currentUser.profileImg = profileImg;
      }

      currentUser.updatedAt = new Date();

      await currentUser.save();
    }

    const payload = { id: currentUser._id, type: accType };

    // Generate tokens
    const accessToken = genarateAccessToken(res, payload);
    const refreshToken = genarateRefreshToken(res, payload);
    

    const responseData = {
      currentUser,
      accType,
      accessToken,
      refreshToken
    };

    if (accType === "user" || accType === "tutor") {
      responseData.isVerified = currentUser.isVerified;
      responseData.isActive = currentUser.isActive;
    }

    if (accType === "tutor") {
      responseData.bio = currentUser.bio;
      responseData.jobTitle = currentUser.jobTitle;
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: responseData,
    });
  } catch (error) {
    console.error("Google authentication error:", error);

    // Handle specific errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token",
      });
    }

    // Default error response
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, email } = req.body;



  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches the stored hashed password
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
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
  
    const { email, firstName, userName, lastName, phone, profileImg } =
      req.body;
    const fullName = `${firstName} ${lastName}`;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(userName && { userName }),
      ...(profileImg && { profileImg }),
    };

    const id = user._id;

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.status(200).json({ message: "Update successful", updatedUser });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logged out successfully" });
};

const toggleNotifications = async (req, res) => {
  try {
    const { userId, notificationId } = req.body;

    console.log(req.body)


    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notification = user.notifications.find((n) => n._id.toString() === notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.isRead = true;
    await user.save();

    res.status(200).json({ message: "Notification changed to read",user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to change notification read status" });
  }
};

const deleteNotification=async(req,res)=>{
  const {userId}=req.params;
  if(!userId ) return res.status(404).json({message:"UserID  is missing "});

  try {
    
    const updatedUser= await User.findById(userId);
    if(!updatedUser) return res.staus(404).json({message:"User not found"});

    updatedUser.notifications=[];

    await updatedUser.save();

    res.status(200).json({message:"notifications deleted",updatedUser});

  } catch (error) {
    console.log("Error deleting notification",error);
    res.status(500).json({message:"Failed to delete notification"});
  }
}

const getCoupons=async(req,res)=>{
  try {
  

    const userId = new ObjectId(req.params.userId);
 
    if(!userId)return res.status(400).json({message:"UserId is missing"})

    const currentDate = new Date(); // Get the current date and time

    const coupons = await Coupon.aggregate([
      {
        $match: {
          isActive: true,
          validTill: { $gt: currentDate },
          usedBy: { $nin: [userId] },
        },
      },
      {
        $addFields: {
          effectiveUsageLimit: { $ifNull: ["$usageLimit", Infinity] }, // Replace null with Infinity
          isUnderUsageLimit: { $lt: ["$usedCount", { $ifNull: ["$usageLimit", Infinity] }] }, // Compare against effective usage limit
        },
      },
      {
        $match: {
          isUnderUsageLimit: true,
        },
      },
    ]);
    
    
    console.log("coupons",coupons);
    
    
    return res.status(200).json({message:"Coupons fetched successfully",coupons})
  
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Internal server error"})
  }
  }


module.exports = {
  googleLogin,
  signUp,
  login,
  updateUser,
  logoutUser,
  sendOtp,
  changePassword,
  toggleNotifications,
  deleteNotification,
  getCoupons
  
  
};
