const Razorpay = require("razorpay");
// const Stripe = require("stripe");

const razorpayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_SECRET_KEY,
});



// const stripeSecretKey = process.env.STRIPE_SECRET_KEY ;

// const stripe = new Stripe(stripeSecretKey, {
//   apiVersion: "2022-11-15", 
//   typescript: false,
//   maxNetworkRetries: 2, // Retry failed requests
//   timeout: 20000, // 20 seconds timeout
// });


module.exports = {razorpayInstance};