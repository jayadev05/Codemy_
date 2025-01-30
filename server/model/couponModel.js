const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Flat'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  usageLimit: {
    type: Number,
    default: null, // No limit if null
  },
  
  usedCount: {
    type: Number,
    default: 0,
  },

  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    },
  ],
  
  validTill: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
