const mongoose = require("mongoose");

const PayoutRequestSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 500,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date, // Timestamp of when the request was processed
  },

  rejectionReason: {
    type: String,
    trim: true,
  },

  paymentDetails: {
    transactionId: {
      type: String, // Transaction ID for tracking
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolderName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },

    upiId: {
      type: String,
      required: function () {
        return this.paymentMethod === "UPI";
      },
      trim: true,
    },
  },
});

module.exports = mongoose.model("Payouts", PayoutRequestSchema);
