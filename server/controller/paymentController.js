const crypto = require("crypto");
const { razorpayInstance } = require("../config/paymentConfig");
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const Lesson = require("../model/lessonModel");
const Course = require("../model/courseModel");
const CourseProgress = require("../model/courseProgressModel");

const createOrder = async (req, res) => {
  const { amount, userId, courses, paymentMethod } = req.body;

  const options = {
    amount: amount,
    currency: "INR",
    receipt: `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`,
  };

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create(options);

    console.log("razorePay Order", razorpayOrder);

    const order = await Order.create({
      orderId: razorpayOrder.id,
      userId,
      courses,
      totalAmount: amount,
      payment: {
        paymentId: null,
        status: "Pending",
        paymentMethod: paymentMethod || "UPI",
      },
      orderStatus: "Processing",
    });

    res.status(200).json({
      message: "Order created successfully",
      order: razorpayOrder,
    });
  } catch (error) {
    console.error("Failed to create an Order:", error);
    res.status(500).json({
      message: "Failed to create order.",error
    });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  try {
    
    // Verify signature

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

  

    if (generated_signature !== razorpay_signature) {    
      return res
        .status(400)
        .json({ success: false, message: "Signature verification failed" });
    }

    // Fetch and update the order
    const order = await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        $set: {
          "payment.paymentId": razorpay_payment_id,
          "payment.status": "Completed",
        },orderStatus:"Completed"
      },
      { new: true }
    );

    if (!order) throw new Error("Order not found");

    // Update student's active courses
    await User.updateOne(
      { _id: order.userId },
      { $addToSet: { activeCourses: { $each: order.courses } } }
    );

    // Increment enrollment counts for courses
    await Course.updateMany(
      { _id: { $in: order.courses } },
      { $inc: { enrolleeCount: 1 } }
    );

    // Prepare and insert course progress for enrolled courses
    const lessons = await Lesson.find({ courseId: { $in: order.courses } });

    const progressDocs = order.courses.map((courseId) => {
      const courseLessons = lessons.filter(
        (lesson) => String(lesson.courseId) === String(courseId)
      );

      const progressArray = courseLessons.map((lesson) => ({
        lessonId: lesson._id,
        status: "not-started",
      }));

      return {
        userId: order.userId,
        courseId: courseId,
        lessonsProgress: progressArray,
        progressPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await CourseProgress.insertMany(progressDocs);

    // Remove courses from the student's cart
    await Cart.updateMany(
      { userId: order.userId },
      {
        $pull: {
          items: {
            courseId: { $in: order.courses },
          },
        },
      }
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Payment verified and courses enrolled successfully",
        orderId:razorpay_order_id
      });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment." });
  }
};

const getOrderDetails =async (req,res)=>{
  try {
    const {orderId}=req.params;

    if(!orderId) return res.status(400),json({message:"orderId is missing"})

    const order= await Order.findOne({orderId});
   

    if(!order) return res.status(404).json({message:"Order not found"})


    return res.status(200).json({message:"Details fetched successfully",order});
  } catch (error) {
    console.log("Error fetching order details",error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  getOrderDetails
};
