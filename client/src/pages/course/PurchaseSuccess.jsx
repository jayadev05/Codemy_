import React, { useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { CheckCircleIcon } from "lucide-react";
import axiosInstance from "@/config/axiosConfig";

const PurchaseCompleted = () => {
  const { orderId } = useParams();

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



  const navigate = useNavigate();

  return (
    <>
      <Header />
      <MainHeader />
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 lg:mt-[-60px]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-center py-8 px-6">
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto shadow-md">
              <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Purchase Complete
            </h1>
            <p className="text-emerald-100 text-base">
              Thank you for investing in your learning journey
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Order Summary
              </h2>
              <div className="bg-emerald-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 font-medium">
                    Order Number
                  </span>
                  <span className="text-neutral-800 font-semibold">
                    {order.orderId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 font-medium">
                    Payment ID
                  </span>
                  <span className="text-neutral-800 font-semibold">
                    {order.payment?.paymentId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600 font-medium">
                    Total Amount
                  </span>
                  <span className="text-emerald-600 font-bold">
                    ₹{order.totalAmount / 100}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate("/user/profile")}
                className="w-full bg-emerald-50 text-emerald-600 font-semibold py-3 rounded-lg transition-all duration-300 hover:bg-emerald-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
      <SecondaryFooter />
    </>
  );
};

export default PurchaseCompleted;
