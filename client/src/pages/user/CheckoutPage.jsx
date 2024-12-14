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

  const handleCheckout = async() => {

    try {
      
      //Order creation

      const response=await axios.post('http://localhost:3000/checkout/order-create',{amount:total,userId:user._id,courses,paymentMethod})

      const {id:razorpayOrderId, amount,currency}=response.data.order;

      
      const amountInPaise = amount*100
      
      //Razorpay payment option

      const options={
        key:'rzp_test_PEILuGv0t2XI3a',
        amount: amountInPaise, 
        currency: currency,
        name:"Codemy",
        description:"Purchase Courses",
        order_id: razorpayOrderId,
        handler:async function (paymentResponse){
          try {
         
            await verifyRazorpayPayment(paymentResponse);

          } catch (error) {
              console.log(error);
              toast.error("Failed to verify payment details");
          }
     
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment process canceled. Please try again.");
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

  const verifyRazorpayPayment=async(paymentResponse)=>{
    try {
      
      console.log(paymentResponse,"payment response");

      const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = paymentResponse;

      const response=await axios.post('http://localhost:3000/checkout/verify-payment',{razorpay_order_id,razorpay_payment_id,razorpay_signature});

      if(response.status===200){
        console.log(response,"asdasd")
        const orderId=response.data.orderId
        dispatch(clearCart(cart));
        navigate(`/user/payment-success/${orderId}`)
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
                          checked={paymentMethod === "Bank Transfer"}
                          onChange={() => handlePaymentMethodChange("Bank Transfer")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Bank Transfer</span>
                      </label>

                      <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => handlePaymentMethodChange("card")}
                          className="h-4 w-4 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Credit / Debit Card</span>
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
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 text-white rounded-lg px-4 py-3 mt-6 hover:bg-orange-600 transition-colors"
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

