const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", 
    required: true,
  },

  lessonsProgress: [
    {
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
      },
      status: {
        type: String,
        enum: ["not-started", "in-progress", "completed"],
        default: "not-started",
      },
    },
  ],

  certificateUrl:{
    type:String,
    default:null,
  },

  progressPercentage: {
    type: Number,
    default: 0, 
    min: 0,
    max: 100,
  },

  lastAccessedLessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson", 
    default:null
  },

  isCompleted: {
    type: Boolean,
    default: false, 
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




// Static method to update progress and completion status
courseProgressSchema.methods.updateProgress = async function (totalLectures) {
  const completedCount = this.completedLectures.length;
  this.progressPercentage = (completedCount / totalLectures) * 100;
  this.isCompleted = completedCount === totalLectures;
  return this.save();
};

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

module.exports = CourseProgress;
