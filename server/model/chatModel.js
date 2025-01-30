const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true
    },
    isOnline: {
      student: { type: Boolean, default: false },
      tutor: { type: Boolean, default: false }
    },
    unreadCount: {
      student: { type: Number, default: 0, min: 0 },
      tutor: { type: Number, default: 0, min: 0 }
    },
    lastMessage: {
      content: { type: String, default: '' },
      contentType:{type:String,default:'text' , enum:['text','media']},
      senderId: { type: mongoose.Schema.Types.ObjectId },
      timestamp: { type: Date, default: Date.now }
    },
    deletedBy : [
      {
        type : mongoose.Schema.Types.ObjectId
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);    