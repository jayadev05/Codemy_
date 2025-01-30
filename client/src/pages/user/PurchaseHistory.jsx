"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  CreditCard,
  IndianRupeeIcon,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import Pagination from "../../components/utils/Pagination";
import Tabs from "../../components/layout/user/Tabs";
import { clearCart } from "../../store/slices/cartSlice";
import { useNavigate } from "react-router";
import axiosInstance from "@/config/axiosConfig";

const PurchaseHistory = () => {
  const user = useSelector(selectUser);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const orderPerPage = 3;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/checkout/orders/${user._id}/history`
        );
        setOrders(response.data.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setError("Failed to load order history. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user._id]);

  const handleRetryPayment = async (order) => {
    try {
      // Don't set loading state here as it may interfere with Razorpay window
      const options = {
        key: "rzp_test_PEILuGv0t2XI3a",
        amount: order.totalAmount,
        currency: "INR",
        name: "Codemy",
        description: "Purchase Courses",
        order_id: order.orderId,
        handler: async function (paymentResponse) {
          try {
            setIsLoading(true); // Set loading only during verification
            await verifyRazorpayPayment(paymentResponse);
          } catch (error) {
            console.log(error);
            navigate(`/user/payment-failure/${order.orderId}`);
            toast.error(
              "We couldn't verify your payment details 💳. Please check and retry"
            );
          } finally {
            setIsLoading(false); // Clear loading after verification
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Oops! The payment failed. Please retry.", {
              icon: "💸",
            });
          },
          escape: true, // Allows escape key to close the modal
          animation: true, // Enables smooth animations
          backdropClose: true, // Allows clicking outside to close
        },
        theme: {
          color: "#fa7516",
        },
        method: order.payment?.paymentMethod,
        prefill: {
          // Add prefill if you have user details
          email: user.email,
          contact: user.phone,
        },
        notes: {
          orderId: order.orderId,
        },
      };

      // Create and open Razorpay instance
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Failed to retry payment:", error);
      setError("Failed to retry payment. Please try again later.");
      setIsLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const renderPaymentMethodIcon = (method) => {
    switch (method.toUpperCase()) {
      case "UPI":
        return <IndianRupeeIcon className="h-4 w-4" />;
      case "CREDIT CARD":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <IndianRupeeIcon className="h-4 w-4" />;
    }
  };

  const paginateData = (data) => {
    const startIndex = currentPage * orderPerPage - orderPerPage;
    const endIndex = startIndex + orderPerPage;
    return data.slice(startIndex, endIndex);
  };

  const filteredOrder = paginateData(orders);

  return (
    <>
      <Header />
      <MainHeader />
      <Tabs />

      <div className="min-h-screen bg-gray-50 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 rounded-lg">
            <div className="text-center text-red-500 font-medium">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                No Orders Yet
              </h2>
              <p className="mt-2 text-gray-600">
                When you make a purchase, your orders will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Purchase History
              </h1>
              <p className="mt-2 text-gray-600">
                Track all your course purchases and their status
              </p>
            </div>

            <div className="space-y-4">
              {filteredOrder.map((order) => {
                const course = order.course["0"];
                const courseNumber = order.course?.length;
                console.log("No of courses in order", courseNumber);
                const isPending = order.orderStatus === "Pending";

                return (
                  <div
                    key={order.orderId}
                    onClick={() => handleOrderClick(order)}
                    className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md hover:cursor-pointer"
                  >
                    <div className="flex gap-6 p-6">
                      <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={course?.thumbnail || "/placeholder.svg"}
                          alt={course?.title || "Course unavailable"}
                          className="absolute inset-0 h-full w-full object-cover"
                          width={640}
                          height={360}
                          onError={(e) => {
                            // Reset src to our custom placeholder
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />

                        {/* Overlay for deleted/unavailable courses */}
                        {!course?.thumbnail && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/95">
                            <AlertCircle className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                              This course might be deleted
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900">
                              {order.course?.length > 1
                                ? `${course?.title.slice(0, 25)} ...+${
                                    order.course?.length - 1
                                  }`
                                : course?.title || "Course details unavailable"}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  order.orderStatus === "Completed"
                                    ? "bg-green-50 text-green-700"
                                    : order.orderStatus === "Pending"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    order.orderStatus === "Completed"
                                      ? "bg-green-600"
                                      : order.orderStatus === "Pending"
                                      ? "bg-yellow-600"
                                      : "bg-red-600"
                                  }`}
                                />
                                {order.orderStatus}
                              </span>

                              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                                {renderPaymentMethodIcon(order.paymentMethod)}
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{(order.totalAmount / 100).toFixed(2)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatDate(order.purchaseDate)}
                            </p>
                          </div>
                        </div>

                        {isPending && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleRetryPayment(order)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Retry Payment
                            </button>
                          </div>
                        )}
                      </div>

                      {order.orderStatus === "Completed" ? (
                        <ArrowUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                {selectedOrder && (
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-4">
                        <span className="font-medium">Order ID</span>
                        <span className="text-gray-600">
                          {selectedOrder.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-4">
                        <span className="font-medium">Date</span>
                        <span className="text-gray-600">
                          {formatDate(selectedOrder.purchaseDate)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-4">
                        <span className="font-medium">Status</span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedOrder.orderStatus === "Completed"
                              ? "bg-green-50 text-green-700"
                              : selectedOrder.orderStatus === "Pending"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              selectedOrder.orderStatus === "Completed"
                                ? "bg-green-600"
                                : selectedOrder.orderStatus === "Pending"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                          />
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">Purchased Courses</h3>
                        {selectedOrder.course?.map((course, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 border-b pb-4"
                          >
                            <img
                              src={
                                course?.thumbnail || "/placeholder-course?.png"
                              }
                              alt={course?.title}
                              className="h-16 w-24 rounded object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{course?.title}</h4>
                              <p className="text-sm text-gray-600">
                                Instructor: {course?.tutor}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between border-b pb-4">
                        <span className="font-medium">Payment Method</span>
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          {renderPaymentMethodIcon(selectedOrder.paymentMethod)}
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Amount</span>
                        <span className="text-lg font-semibold">
                          ₹{(selectedOrder.totalAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Pagination
              className="flex justify-center mt-6"
              dataPerPage={orderPerPage}
              totalData={orders.length}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>

      <SecondaryFooter />
    </>
  );
};

export default PurchaseHistory;
