const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new mongoose.Schema(
  {
  title: { type: String, required: true },

  description: String,

  tutorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  categoryId: { type:  Schema.Types.ObjectId, ref: 'Category', required: true },

  language: String,

  level: String,

  price: { type:Schema.Types.Decimal128, required: true },

  enrolleeCount: { type: Number, default: 0 },

  duration: Number,

  thumbnail: String,

  // Embedded lectures array for better performance

  lectures: [{

    title: String,

    video: String,

    duration: Number,

    videoThumbnail: String,

    description: String,

    lectureNote: String,

    createdAt: Date,

    updatedAt: Date

  }],

  createdAt: { type: Date, default: Date.now },
  
  updatedAt: { type: Date, default: Date.now }

},{
  timestamps: true,
 });

const Course = mongoose.model('courses', CourseSchema);
module.exports =Course;