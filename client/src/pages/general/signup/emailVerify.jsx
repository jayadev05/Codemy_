import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axiosConfig";

export default function EmailVerify({ formData, setIsModalVisible }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const requestPayload = {
        userName: formData.username,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        otp: otpString,
      };

      const response = await axiosInstance.post("/user/users", requestPayload);

      toast.success(
        "Account created successfully! You can login with the credentials"
      );
      setIsModalVisible(false);
      navigate("/login");
    } catch (error) {
      console.error("Full error:", error);
      console.error("Response data:", error.response?.data);

      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/user/otp/send", {
        email: formData.email,
      });

      if (response.data.success) {
        toast.success("OTP resent successfully!");
        setTimer(60); // Start 1-minute countdown
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">
          OTP Verification
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter the verification code we just sent to your email
        </p>
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:border-orange-500 focus:ring focus:ring-orange-200 focus:outline-none"
            />
          ))}
        </div>
        <p className="text-center text-gray-600 mb-6">
          Didn't receive code?{" "}
          {timer > 0 ? (
            <span className="text-orange-500">
              Resend in {formatTime(timer)}
            </span>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-blue-500 hover:underline focus:outline-none"
            >
              Resend
            </button>
          )}
        </p>
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-200 disabled:bg-orange-300"
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
