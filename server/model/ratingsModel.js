const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
  
  },
  userId: {
    type: String,
    required: true,
  },
  rating:{
    type:Number,
    min:0,
    max:5,
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