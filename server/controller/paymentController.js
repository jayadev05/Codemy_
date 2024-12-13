// const crypto = require("crypto");
// const { razorpayInstance } = require("../config/payment");
// const Order = require("../models/orderModel");
// const User = require("../models/userModel");
// const Cart = require("../models/cartModel");
// const Lesson = require("../models/lessonModel");
// const Course = require("../models/courseModel");
// const CourseProgress = require("../models/courseProgressModel");

// const createOrder = async (req, res) => {
//   const { amount, studentId, courses } = req.body;

//   const options = {
//     amount,
//     currency: "INR",
//     receipt: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
//   };

//   try {
//     const order = await razorpayInstance.orders.create(options);

//     const newOrder = await Order.create({
//       order_id: order.id,
//       amount: order.amount / 100,
//       currency: order.currency,
//       receipt: order.receipt,
//       studentId,
//       courses: courses.map((course) => course.courseId),
//     });

//     res.status(200).json(order);
//   } catch (error) {
//     console.error("Error creating Razorpay order:", error);
//     res.status(500).json({ error: "Failed to create order." });
//   }
// };

// const verifyPayment = async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//   try {
//     // Verify signature
//     const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generated_signature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Payment verification failed" });
//     }

//     // Fetch and update the order
//     const order = await Order.findOneAndUpdate(
//       { order_id: razorpay_order_id },
//       { payment_id: razorpay_payment_id, status: "success" },
//       { new: true }
//     );

//     if (!order) throw new Error("Order not found");

//     // Update student's active courses
//     await Student.updateOne(
//       { userId: order.studentId },
//       { $addToSet: { active_courses: { $each: order.courses } } }
//     );

//     // Increment enrollment counts for courses
//     await Course.updateMany(
//       { courseId: { $in: order.courses } },
//       { $inc: { enrolled_count: 1 } }
//     );

//     // Prepare and insert course progress for enrolled courses
//     const lectures = await Lecture.find({ courseId: { $in: order.courses } });
//     const progressDocs = order.courses.map((courseId) => {
//       const courseLectures = lectures.filter((lecture) => String(lecture.courseId) === String(courseId));
//       const progressArray = courseLectures.map((lecture) => ({
//         lecture_id: lecture.lecture_id,
//         status: "not-started",
//       }));

//       return {
//         studentId: order.studentId,
//         courseId: courseId,
//         progress: progressArray,
//         overallProgress: 0,
//         enrollment_date: new Date(),
//       };
//     });

//     await CourseProgress.insertMany(progressDocs);

//     // Remove courses from the student's cart
//     await Cart.updateMany(
//       { userId: order.studentId },
//       { $pull: { courses: { courseId: { $in: order.courses } } } }
//     );

//     res.status(200).json({ success: true, message: "Payment verified and courses enrolled successfully" });
//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     res.status(500).json({ error: "Failed to verify payment." });
//   }
// };

// module.exports = {
//   createOrder,
//   verifyPayment,
// };





