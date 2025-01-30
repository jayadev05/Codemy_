const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new mongoose.Schema(
  {
  title: { type: String, required: true },

  description: String,

  topic:String,

  tutorId: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },

  categoryId: { type:  Schema.Types.ObjectId, ref: 'Category', required: true },

  language: String,

  level: String,
  
  topic:String,

  courseContent:String,

  price: { type:Schema.Types.Decimal128, required: true },

  enrolleeCount: { type: Number, default: 0 },

  duration: Number,

  durationUnit:String,

  thumbnail: String,

  isListed:{
    type:Boolean,
    default:true
  },

  ratings:[Number],

  ratingsCount:Number,

  averageRating:{
    type:Number,
    default:0
  },


  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],

  createdAt: { type: Date, default: Date.now },
  
  updatedAt: { type: Date, default: Date.now }

},{
  timestamps: true,
 });

const Course = mongoose.model('Course', CourseSchema);
module.exports =Course;