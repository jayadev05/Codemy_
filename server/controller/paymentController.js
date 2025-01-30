const crypto = require("crypto");
const { razorpayInstance } = require("../config/paymentConfig");
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const Tutor = require("../model/tutorModel");
const Lesson = require("../model/lessonModel");
const Course = require("../model/courseModel");
const CourseProgress = require("../model/courseProgressModel");
const Coupon = require('../model/couponModel');


const createOrder = async (req, res) => {
  const { amount, userId, courses, paymentMethod, couponCode,discountAmount } = req.body;

  const amountInPaise = Math.round(amount * 100);
 

  try {
    
    const options = {
      amount: amountInPaise , 
      currency: 'INR',
      receipt: `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create order in the database
    const order = await Order.create({
      orderId: razorpayOrder.id,
      userId,
      courses,
      totalAmount: amountInPaise,
      discount: {
        couponCode,
        discountAmount,
      },
      payment: {
        paymentId: null,
        status: 'Pending',
        paymentMethod: paymentMethod || 'UPI',
      },
      orderStatus: 'Processing',
    });

    res.status(200).json({
      message: 'Order created successfully',
      order: razorpayOrder,
    });
  } catch (error) {
    console.error('Failed to create an Order:', error);
    res.status(500).json({
      message: 'Failed to create order.',
      error,
    });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature , userId } =
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

    console.log("Order",order);

    if (!order) throw new Error("Order not found");

    //Update coupon used count and usedBy

    if(order.discount.couponCode){
      const updatedCoupon = await Coupon.findOne({code:order.discount?.couponCode});

      updatedCoupon.usedCount+=1;
      updatedCoupon.usedBy.push(userId)
  
      await updatedCoupon.save()
    }

  
    

    // Update student's active courses
    const updatedUser = await User.findOneAndUpdate(
      { _id: order.userId },
      { $addToSet: { activeCourses: { $each: order.courses } } },
       { new: true }
    );

   

    // Increment enrollment counts for courses
    await Course.updateMany(
      { _id: { $in: order.courses } },
      { $inc: { enrolleeCount: 1 } }
    );

    // Increase revenue for tutor
    const courses = await Course.find({_id:{$in:order.courses}});

    for (const course of courses) {
      
    
      await Tutor.findOneAndUpdate(
          { _id: course.tutorId }, 
          { $inc: {totalRevenue: order.totalAmount /100 } }, 
          { new: true } 
      );
  }
    

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
        orderId:razorpay_order_id,
        updatedUser
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
    const orders= await Order.find({userId}).sort({createdAt:-1});

 

    const courseIds = [...new Set(orders.flatMap(order => order.courses))];

    const courses = await Course.find({ _id: { $in: courseIds } })
    .select('title price thumbnail tutorId').populate('tutorId','fullName');

//response data
  let data = orders.map(order => {
    
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
            thumbnail: course.thumbnail,
            tutor:course.tutorId.fullName
      };
    }).filter(Boolean); // Remove any null entries
    
    
    return {
        ...orderBaseDetails,
        course:orderCourses
    };

   

  });

  data.sort((a,b)=>b.purchaseDate - a.purchaseDate);

  


    res.status(200).json({message:"Orders fetched successfully",data});
    
  } catch (error) {
    console.log("Error in fetching order history",error);
    res.status(500).json({message:"Orders fetching failed"});
  }
}


module.exports = {
  createOrder,
  verifyPayment,
  getOrderDetails,
  getOrderHistory,

};
