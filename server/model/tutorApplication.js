const mongoose = require('mongoose');

const instructorApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: Number,
    trim: true
  },
  experience: {
    required:true,
    type: String,
    default: ''
  },
  field: {
    required:true,
    type: String,
    default: ''
  },
  credentials: [{
    certificate: {
      type: String, // File path to the certificate
      default: ''
    },
    mimeType: String,
    
  }],
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewNotes: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('InstructorApplication', instructorApplicationSchema);