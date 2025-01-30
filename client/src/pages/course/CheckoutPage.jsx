"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  CreditCard,
  Wallet,
  Building2,
  Globe,
  ChevronRight,
  Tag,
  X,
  Loader2,
  Receipt,
  ShoppingBag,
} from "lucide-react";

import { clearCart, selectCart } from "../../store/slices/cartSlice";
import { addUser, selectUser } from "../../store/slices/userSlice";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import axiosInstance from "@/config/axiosConfig";

const PAYMENT_METHODS = [
  {
    id: "UPI",
    name: "UPI",
    icon: Wallet,
    description: "Pay using UPI apps like Google Pay, PhonePe, etc.",
  },
  {
    id: "Net Banking",
    name: "Bank Transfer",
    icon: Building2,
    description: "Direct bank transfer using Net Banking",
  },
  {
    id: "Cards",
    name: "Credit / Debit Card",
    icon: CreditCard,
    description: "Pay using credit or debit card",
  },
  {
    id: "International Options",
    name: "International Payment",
    icon: Globe,
    description: "Options for international payments",
  },
];

export default function CheckoutPage() {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  let totalCartPrice = cart.totalCartPrice;
  let discountAmount = 0;

  totalCartPrice = Math.max(totalCartPrice, 0);
  const tax = parseInt((totalCartPrice * 0.04).toFixed(1));
  let total = parseInt(totalCartPrice + tax);

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "Percentage") {
      discountAmount = (totalCartPrice * appliedCoupon.discountValue) / 100;
      total -= discountAmount;
    } else if (appliedCoupon.discountType === "Flat") {
      discountAmount = appliedCoupon.discountValue;
      total -= discountAmount;
    }
  }

  const courses = cart.items.map((course) => course.courseId._id);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const response = await axiosInstance.get(`/user/coupons/${user._id}`);
        setAvailableCoupons(response.data.coupons);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };
    fetchCoupons();
  }, [user._id]);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleLocalPayment = async () => {
    try {
      const response = await axiosInstance.post("/checkout/orders", {
        amount: total,
        userId: user._id,
        courses,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discountAmount,
      });

      const { id: razorpayOrderId, amount, currency } = response.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_SECRET,
        amount,
        currency,
        name: "Codemy",
        description: "Purchase Courses",
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            await verifyRazorpayPayment(paymentResponse);
          } catch (error) {
            console.log(error);
            navigate(`/user/payment-failure/${razorpayOrderId}`);
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
        method: paymentMethod,
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("An Error occurred while payment, Try again");
    }
  };

  const handleGlobalPayment = async () => {
    try {
      const response = await axiosInstance.post("/checkout/orders", {
        amount: total,
        userId: user._id,
        courses,
        paymentMethod,
      });

      const { clientSecret, orderId } = response.data;

      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user.name,
              email: user.email,
            },
          },
        }
      );

      if (error) {
        console.error("Payment failed:", error);
        navigate(`/user/payment-failure/${orderId}`);
        toast.error("Payment failed. Please retry.");
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await axiosInstance.post("/checkout/payment/verify", {
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
  };

  const verifyRazorpayPayment = async (paymentResponse) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        paymentResponse;

      const response = await axiosInstance.post("/checkout/payment/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId: user._id,
      });

      if (response.status === 200) {
        const orderId = response.data.orderId;
        navigate(`/user/payment-success/${orderId}`);
        dispatch(clearCart(cart));
        console.log("updatedUser",response.data.updatedUser)
        dispatch(addUser(response.data.updatedUser));
        toast.success("Course purchased successfully!");
      }
    } catch (error) {
      navigate(`/user/payment-failure/${orderId}`);
      console.log("Error in verifying payment", error);
    }
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const coupon = availableCoupons.find(
      (coupon) => coupon.code === couponCode
    );

    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }

    setAppliedCoupon(coupon);
    toast.success(`Coupon ${couponCode} applied successfully!`, { icon: "🎉" });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed successfully!");
  };

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
              <button
                onClick={() => navigate("/user/cart")}
                className="text-gray-600 hover:text-gray-900"
              >
                Shopping Cart
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Checkout</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Payment Method
                  </h2>

                  <div className="grid gap-4">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? "border-orange-500 bg-orange-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() =>
                              handlePaymentMethodChange(method.id)
                            }
                            className="mt-1 h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="font-medium">{method.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {method.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart?.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex gap-4 pb-4 border-b last:border-0"
                      >
                        <img
                          src={item.courseId.thumbnail}
                          alt={item.courseId.title}
                          className="w-20 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1">
                            {item.courseId.title}
                          </h3>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Total :</span>
                      <span>₹{cart.totalCartPrice}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Tax :</span>
                      <span>₹{tax}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Discount :</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t">
                      <span>Sub Total :</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={
                      paymentMethod === "International Options"
                        ? handleGlobalPayment
                        : handleLocalPayment
                    }
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    Proceed to Payment <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Coupon Section */}
                  <div className="mt-6 space-y-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <div>
                          <p className="font-medium text-orange-700">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-sm text-orange-600">
                            {appliedCoupon.discountType === "Percentage"
                              ? `${appliedCoupon.discountValue}% off`
                              : `₹${appliedCoupon.discountValue} off`}
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-orange-700 hover:text-orange-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {/* Available Coupons */}
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <Tag className="w-4 h-4" />
                        Available Coupons
                      </h3>
                      {isLoadingCoupons ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : availableCoupons.length > 0 ? (
                        <div className="space-y-3">
                          {availableCoupons.map((coupon) => (
                            <div
                              key={coupon._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => setCouponCode(coupon.code)}
                            >
                              <div>
                                <p className="font-medium">{coupon.code}</p>
                                <p className="text-sm text-gray-600">
                                  {coupon.description}
                                </p>
                              </div>
                              <span className="text-orange-500 font-medium">
                                {coupon.discountType === "Percentage"
                                  ? `${coupon.discountValue}% off`
                                  : `₹${coupon.discountValue} off`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          No coupons available at the moment
                        </p>
                      )}
                    </div>
                  </div>
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
