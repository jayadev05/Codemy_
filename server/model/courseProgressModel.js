const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", 
    required: true,
  },
  completedLectures: {
    type: [mongoose.Schema.Types.ObjectId], // Array of Lecture IDs
    ref: "Lesson",
    default: [],
  },
  progressPercentage: {
    type: Number,
    default: 0, 
    min: 0,
    max: 100,
  },
  lastAccessedLectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson", // ID of the last accessed lecture
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
