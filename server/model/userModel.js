const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: Number,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },

    profileImg: {
      type: String,
      default: "",
    },

    activeCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default:[]
      },
    ],
    isVerified: {
      type: Boolean,
      default: true,
    },
    notifications: [
      {
        type: { type: String }, 
        title: { type: String, required: true }, 
        content: { type: String, required: true },
        isRead: { type: Boolean, default: false }, // Read/unread status
        createdAt: { type: Date, default: Date.now }, 
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
