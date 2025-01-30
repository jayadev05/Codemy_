const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    couponCode: {
      type: String,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    }
  },
  payment: {
    paymentId: {
      type: String,
      default:null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cards', 'Net Banking', 'UPI', 'International Options'],
      required: true,
    }
  },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Completed', 'Canceled'],
    default: 'Processing',
  },
  timestamps: {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
