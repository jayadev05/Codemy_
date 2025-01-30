const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  lessonTitle: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tutors',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default:0
  },
  durationUnit:{
    type:String,
    default:'minutes'
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  lessonNotes:{
    type: String,
    required: true,
  },
  lessonThumbnail:{
    type:String
  },
},{
  timestamps: true,
 });

const Lesson = mongoose.model('Lesson', LessonSchema);
module.exports =Lesson;                     