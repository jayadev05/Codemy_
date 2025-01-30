import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import axiosInstance from "@/config/axiosConfig";
import { clearCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const PaymentFailed = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState({});
  

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/checkout/order/${orderId}/details`
        );

        setOrder(response.data.order);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrderDetails();
  }, []);

  const handleRetryPayment = async () => {
    try {
      //Razorpay payment retry option

      const options = {
        key: "rzp_test_PEILuGv0t2XI3a",
        amount: order.totalAmount,
        currency: "INR",
        name: "Codemy",
        description: "Purchase Courses",
        order_id: order.orderId,
        handler: async function (paymentResponse) {
          try {
            await verifyRazorpayPayment(paymentResponse);
          } catch (error) {
            console.log(error);
            navigate(`/user/payment-failure/${order.orderId}`);
            toast.error(
              "We couldn't verify your payment details 💳. Please check and retry"
            );
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Oops! The payment failed. Please retry.", {
              icon: "💸",
            });
          },
        },
        theme: {
          color: "#fa7516",
        },
        method: order.payment?.paymentMethod,
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Failed to retry payment:", error);
      setError("Failed to retry payment. Please try again later.");
    } finally {
    }
  };

  const verifyRazorpayPayment = async (paymentResponse) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        paymentResponse;

      const response = await axiosInstance.post("/checkout/payment/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (response.status === 200) {
     
        const orderId = response.data.orderId;
        navigate(`/user/payment-success/${orderId}`);
        dispatch(clearCart(cart));
        toast.success("Course purchased successfully!");
      }
    } catch (error) {
      console.log("Error in verifying payment", error);
    }
  };

  return (
    <>
      <Header />
      <MainHeader />
      <div className="bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-6 text-white text-center">
            <div className="mb-4 inline-block p-2 bg-white rounded-full">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2">Payment Failed</h1>
            <p className="text-red-200 text-lg">
              We couldn't process your payment
            </p>
          </div>
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Order Details
              </h2>
              <div className="bg-red-50 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Order Number:</span>{" "}
                  {order.orderId}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Payment ID:</span>{" "}
                  {order.payment?.paymentId}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Total Amount:</span> ₹
                  {order.totalAmount / 100}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={handleRetryPayment}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Retry Payment
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <SecondaryFooter />
    </>
  );
};

export default PaymentFailed;
