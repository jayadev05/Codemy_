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

  const amountInPaise = Math.round(amount * 100);

  const options = {
    amount: amountInPaise,
    currency: "INR",
    receipt: `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`,
  };

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create(options);


    const order = await Order.create({
      orderId: razorpayOrder.id,
      userId,
      courses,
      totalAmount: amountInPaise,
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

const getOrderHistory=async(req,res)=>{
  const {userId}=req.params;

  if(!userId) return res.status(400).json({message:"User id is missing "})

  try {
    const orders= await Order.find({userId});

    const courseIds = [...new Set(orders.flatMap(order => order.courses))];

    const courses = await Course.find({ _id: { $in: courseIds } })
    .select('title price thumbnail');

//response data
  const data = orders.map(order => {
    
    const orderBaseDetails = {
        orderId:order.orderId,
        paymentMethod: order.payment.paymentMethod,
        orderStatus: order.payment.status,
        purchaseDate: order.timestamps.createdAt,
        totalAmount: order.totalAmount
    };
    
    // Map courses for this specific order
    const orderCourses = order.courses.map(courseId => {

        const course = courses.find(c => c._id.toString() === courseId.toString());
        
        if (!course) return null;
        
        return {
            courseId: course._id,
            title: course.title,
            price: course.price,
            thumbnail: course.thumbnail
      };
    }).filter(Boolean); // Remove any null entries
    
    
    return {
        ...orderBaseDetails,
        course:orderCourses
    };

   

  });



    res.status(200).json({message:"Orders fetched successfully",data});
    
  } catch (error) {
    console.log("Error in fetching order history",error);
    res.status(500).json({message:"Orders fetching failed"});
  }
}

const createStripeOrder=async(req,res)=>{
  const { amount, userId, courses, paymentMethod } = req.body;

  // Convert amount to the smallest currency unit (paise to rupees or cents)
  const amountInCents = Math.round(amount * 100);

  try {
    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "INR",
      payment_method_types: [paymentMethod || "International Card"], // Default to "card"
      metadata: {
        userId,
        courses: JSON.stringify(courses),
      },
    });

    // Save the order to the database
    const order = await Order.create({
      orderId: paymentIntent.id,
      userId,
      courses,
      totalAmount: amountInCents,
      payment: {
        paymentId: null,
        status: "Pending",
        paymentMethod: paymentMethod || "International Card",
      },
      orderStatus: "Processing",
    });

    res.status(200).json({
      message: "Order created successfully",
      clientSecret: paymentIntent.client_secret, // Send this to the frontend
    });
  } catch (error) {
    console.error("Failed to create Payment Intent:", error);
    res.status(500).json({
      message: "Failed to create order.",
      error: error.message,
    });
  }
}

const verifyStripePayment=async(req,res)=>{
  const { paymentIntentId, orderId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const order = await Order.findOneAndUpdate(
        { orderId: paymentIntentId },
        {
          $set: {
            "payment.paymentId": paymentIntentId,
            "payment.status": "Completed",
          },
          orderStatus: "Completed",
        },
        { new: true }
      );

      if (!order) throw new Error("Order not found");

      // Additional steps: Enroll student, update course counts, etc.
      res.status(200).json({
        success: true,
        message: "Payment verified and courses enrolled successfully",
        orderId,
      });
    } else {
      res.status(400).json({ message: "Payment not successful." });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment." });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  getOrderDetails,
  getOrderHistory,
  createStripeOrder,
  verifyStripePayment
};
