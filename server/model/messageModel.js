const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat', 
      index: true,
      required: true,
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ['tutor', 'user'],
        required: true,
      },
    },

    receiver: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ['tutor', 'user'],
        required: true,
      },
    },
    
    content: {
      type: String,
      required: true,
      maxLength: 5000
    },

    isRead: {
      type: Boolean,
      default: false, 
    },
  },
  { 
    timestamps: true,
    indexes: [{ chatId: 1, createdAt: -1 }]
   } 
);

module.exports = mongoose.model('Message', messageSchema);