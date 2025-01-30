
const mongoose = require("mongoose");
const { Schema } = mongoose;


const wishlistSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);


const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
