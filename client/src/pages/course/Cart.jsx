"use client";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Heart, Tag, ShoppingBag, ChevronRight, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { selectUser } from "../../store/slices/userSlice";
import {
  addToCart,
  removeFromCart,
  selectCart,
  setCart,
} from "../../store/slices/cartSlice";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import axiosInstance from "@/config/axiosConfig";

export default function ShoppingCart() {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get("/user/cart", {
          params: { userId: user._id },
        });
        dispatch(setCart(response.data.cart));
      } catch (error) {
        console.log("Failed to fetch cart", error);
        toast.error("Failed to load cart");
      }
    };

    fetchCart();
  }, [dispatch, user._id]);

  const handleRemoveFromCart = async (courseId) => {
    try {
      await axiosInstance.delete("/user/cart/remove", {
        params: { userId: user._id, courseId },
      });

      dispatch(removeFromCart(courseId));

      toast.success("Item removed from cart", {
        icon: "🛒",
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove course from cart");
    }
  };

  if (!cart.items.length) {
    return (
      <>
        <Header />
        <MainHeader />
        <div className="flex flex-col min-h-[80vh] items-center justify-center py-12 bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
            <ShoppingBag size={64} className="text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Your shopping cart is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding courses to your cart and begin your learning journey
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium"
            >
              Browse Courses
            </button>
          </div>
        </div>
        <SecondaryFooter />
      </>
    );
  }

  return (
    <>
      <Header />
      <MainHeader />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Shopping Cart</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Cart Items ({cart?.items?.length})
                  </h2>

                  <div className="divide-y">
                    {cart?.items?.map((item) => (
                      <div key={item._id} className="py-6 first:pt-0 last:pb-0">
                        <div className="flex gap-6">
                          <img
                            src={item.courseId.thumbnail}
                            alt={item.courseId.title}
                            className="w-40 h-28 object-cover rounded-xl"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg line-clamp-1">
                                  {item.courseId.title}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  by {item.courseId.tutorId?.fullName}
                                </p>
                                <div className="flex items-center gap-1 mt-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span className="font-medium">
                                    {item.courseId.averageRating}
                                  </span>
                                  <span className="text-gray-500">
                                    ({item.courseId.ratings?.length} reviews)
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">
                                  ₹{item.price}
                                </p>
                                <button
                                  onClick={() =>
                                    handleRemoveFromCart(item.courseId._id)
                                  }
                                  className="mt-2 text-red-500 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cart.totalCartPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Coupon Discount</span>
                      <span>₹0</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span>₹{cart.totalCartPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/user/checkout")}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ChevronRight className="w-4 h-4" />
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
