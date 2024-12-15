"use client";

import { useDispatch, useSelector } from "react-redux";
import { selectWishlist } from "../../store/slices/wishlistSlice";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import { useNavigate } from "react-router";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import axios from "axios";
import { selectUser } from "../../store/slices/userSlice";
import {
  addToCart,
  removeFromCart,
  selectCart,
  setCart,
} from "../../store/slices/cartSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

export default function ShoppingCart() {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);

  console.log(cart, "Cart in Cart page");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/course/get-cart",
          {
            params: { userId: user._id },
          }
        );

        console.log(response.data.cart);

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
      await axios.delete("http://localhost:3000/course/removeFromCart", {
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

  return (
    <>
      <Header />
      <MainHeader />
      {cart.items.length ? (
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col gap-4">
              <nav className="flex items-center justify-center text-sm">
                <a onClick={() => navigate("/")} className="text-gray-500">
                  Home
                </a>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-900">Shopping Cart</span>
              </nav>

              <h1 className="text-center text-2xl font-semibold mb-6">
                Shopping Cart
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold mb-4">
                        Shopping Cart ({cart?.items?.length})
                      </h2>

                      <div className="space-y-6">
                        {cart?.items?.map((item) => (
                          <div
                            key={item._id}
                            className="flex gap-4 pb-6 border-b last:border-0"
                          >
                            <div className="shrink-0">
                              <img
                                src={item.courseId.thumbnail}
                                alt={item.courseId.title}
                                className="w-30 h-20 object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-medium text-sm">
                                    {item.courseId.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Featured by{" "}
                                    {item.courseId.tutorId?.fullName}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-sm">⭐</span>
                                    <span className="text-sm font-medium">
                                      {item.courseId.averageRating}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({item.courseId.ratings?.length} reviews)
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">₹{item.price}</p>
                                  <button
                                    onClick={() =>
                                      handleRemoveFromCart(item.courseId._id)
                                    }
                                    className="text-orange-500 text-sm mt-2"
                                  >
                                    Remove from cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span>₹{cart.totalCartPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coupon Discount</span>
                        <span>₹0</span>
                      </div>

                      <div className="flex justify-between font-semibold text-lg pt-4 border-t">
                        <span>Total</span>
                        <span>₹{cart.totalCartPrice}</span>
                      </div>
                    </div>

                    <button
                    onClick={()=>navigate('/user/checkout')}
                    className="w-full bg-orange-500 text-white rounded-lg px-4 py-3 mt-6 hover:bg-orange-600 transition-colors">
                      Proceed To Checkout →
                    </button>

                    <div className="mt-6">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon code"
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-[80vh] items-center justify-center py-12">
          <Heart size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Your shopping cart is empty
          </h3>
          <p className="text-gray-500 mb-4">
            Add items that you want to buy to your cart
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Continue Shopping
          </button>
        </div>
      )}

      <SecondaryFooter />
    </>
  );
}
