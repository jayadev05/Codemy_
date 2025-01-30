const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  courseId: {
    type: String,
    ref:'Course',
    required: true,
  
  },
  userId: {
    type: String,
    ref:'User',
    required: true,
  },
  rating:{
    type:Number,
    min:0,
    max:5,
  },

  feedback:{
    type:String
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ratings", ratingSchema);