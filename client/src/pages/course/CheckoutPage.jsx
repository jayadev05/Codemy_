"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, selectCart } from "../../store/slices/cartSlice";
import { selectUser } from "../../store/slices/userSlice";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";
import {loadStripe} from '@stripe/stripe-js'

export default function CheckoutPage() {

  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const navigate = useNavigate();
  const dispatch=useDispatch();
  
  
  const tax = parseInt((cart.totalCartPrice * 0.04).toFixed(1));
  const total=parseInt(cart.totalCartPrice + tax);

 const courses=cart.items.map((course)=>course.courseId._id);

 


  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleLocalPayment = async() => {

    try {
      
      //Order creation

      const response=await axios.post('http://localhost:3000/checkout/order-create',{amount:total,userId:user._id,courses,paymentMethod})

      const {id:razorpayOrderId, amount,currency}=response.data.order;

     
     
  
      //Razorpay payment option

      const options={
        key: import.meta.env.VITE_RAZORPAY_SECRET,
        amount: amount, 
        currency: currency,
        name:"Codemy",
        description:"Purchase Courses",
        order_id: razorpayOrderId,
        handler:async function (paymentResponse){

          try {
         
            await verifyRazorpayPayment(paymentResponse);

          } catch (error) {
              console.log(error);
              navigate(`/user/payment-failure/${razorpayOrderId}`);
              toast.error("We couldn't verify your payment details 💳. Please check and retry");
          }
     
        },

        modal: {
          ondismiss: function () {
            toast.error("Oops! The payment failed. Please retry.",{icon:"💸"});
          },
        },
        theme: {
          color: "#fa7516",
        },
        method: paymentMethod ,
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();


    } catch (error) {
      console.log(error);
      toast.error("An Error occured while payment , Try again");
    }

  };

  const handleGlobalPayment=async()=>{
    try {
     
      const response = await axios.post('http://localhost:3000/checkout/order-create', {
        amount: total,
        userId: user._id,
        courses,
        paymentMethod, 
      });
  
      const { clientSecret, orderId } = response.data;
  
      
      const stripe = await stripePromise; 
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement, // Reference to Stripe's Card Element
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });
  
      if (error) {
        console.error("Payment failed:", error);
        navigate(`/user/payment-failure/${orderId}`);
        toast.error("Payment failed. Please retry.");
        return;
      }
  
      if (paymentIntent.status === "succeeded") {
    
        await axios.post('http://localhost:3000/checkout/payment-verify', {
          paymentIntentId: paymentIntent.id,
          orderId,
        });
  
        toast.success("Payment successful! 🎉");
        navigate(`/user/payment-success/${orderId}`);
      }
    } catch (error) {
      console.error("Error during Stripe payment:", error);
      toast.error("An error occurred during payment. Please retry.");
    }
  }

  const verifyRazorpayPayment=async(paymentResponse)=>{
    try {
      
      const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = paymentResponse;

      const response=await axios.post('http://localhost:3000/checkout/verify-payment',{razorpay_order_id,razorpay_payment_id,razorpay_signature});

      if(response.status===200){
        console.log(response,"asdasd")
        const orderId=response.data.orderId
        navigate(`/user/payment-success/${orderId}`)
        dispatch(clearCart(cart));
        toast.success("Course purchased successfully!");
      }
    } catch (error) {
      console.log("Error in verifying payment",error);
      
    }
  }

  return (
    <>
      <Header />
      <MainHeader />
      <div className="min-h-screen bg-gray-50 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col gap-4">
            <nav className="flex items-center justify-center text-sm">
              <a onClick={() => navigate("/")} className="text-gray-500">
                Home
              </a>
              <span className="mx-2 text-gray-500">/</span>
              <a onClick={() => navigate("/user/cart")} className="text-gray-500">
                Shopping Cart
              </a>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-900">Checkout</span>
            </nav>

            <h1 className="text-center text-2xl font-semibold mb-6">
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="UPI"
                          checked={paymentMethod === "UPI"}
                          onChange={() => handlePaymentMethodChange("UPI")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">UPI</span>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="Bank Transfer"
                          checked={paymentMethod === "Net Banking"}
                          onChange={() => handlePaymentMethodChange("Net Banking")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "Cards"}
                          onChange={() => handlePaymentMethodChange("Cards")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Credit / Debit Card</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="International Options"
                          checked={paymentMethod === "International Options"}
                          onChange={() => handlePaymentMethodChange("International Options")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">International Payment</span>
                      </label>
                    </div>

                    
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 lg:mt-[-60px]">
                  <h2 className="text-lg font-semibold mb-4">
                    Order Summary
                  </h2>
                  <div className="space-y-4 mb-6">
                    {cart?.items?.map((item) => (
                      <div key={item._id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="shrink-0">
                          <img
                            src={item.courseId.thumbnail}
                            alt={item.courseId.title}
                            className="w-20 h-14 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.courseId.title}</h3>
                          <p className="text-sm text-gray-500">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{cart.totalCartPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>₹{tax}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                  <button
                    onClick={paymentMethod==='International Options'?handleGlobalPayment:handleLocalPayment}
                    className="w-full bg-[#ff6738] text-white rounded-lg px-4 py-3 mt-6 hover:bg-orange-600 transition-colors"
                  >
                    Proceed To Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SecondaryFooter />
    </>
  );
}

