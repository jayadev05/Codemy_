const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateUrl: {
    type: String,
    required: true,
    trim: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },

}, {
  timestamps: true
});

// Create a unique index to prevent duplicate certificates
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });



const Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;