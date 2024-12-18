const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

  title: { type: String, required: true },

  description: { type: String, required: true },

  type: { type: String, enum: ['Course Issue', 'Behavior', 'Bug', 'Feedback'], required: true },

  targetType: { type: String, enum: ['Course', 'Tutor'], required: true }, 

  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetType', required: true }, 

  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: { type: String, enum: ['Open', 'Resolved','Rejected'], default: 'Open' },

  createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Report', reportSchema);
