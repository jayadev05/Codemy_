const mongoose = require('mongoose')

const userSchema=new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: Number,
    
  },
  password: {
    type: String,
    required: true
  },
  profileImg: {
    type: String,
    default: ''
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  isActive:{
    type:Boolean,
    default:true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

      resetPasswordToken: String,
      resetPasswordExpires: Date
},{ timestamps: true });


const User = mongoose.model("user",userSchema)

module.exports= User