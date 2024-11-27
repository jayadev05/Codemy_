const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
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
    lowercase: true,
    trim: true
  },
  profileImg: {
    type: String,
    default: ''
  },
  jobTitle: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  totalRevenue: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0
  },
  credentials: [{
    certificate: {
      type: String, // File path to the certificate
      default: ''
    },
    experience: {
      type: String, // e.g., "5 years" or "3 years of teaching experience"
      default: ''
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Tutor', tutorSchema);