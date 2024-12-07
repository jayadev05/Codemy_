const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  lessonTitle: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
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

const Lesson = mongoose.model('lessons', LessonSchema);
module.exports =Lesson;                     