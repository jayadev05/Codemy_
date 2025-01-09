import { useNavigate } from "react-router";
import heroImg from "../../assets/hero.png";
import logo from "../../assets/logo_cap.png";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import axiosInstance from "@/config/axiosConfig";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); // Prevent form submission reload

    // Check if email is valid
    if (!email.trim()) {
      setEmailError("Email cannot be empty");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError(""); // Clear any previous error

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "http://localhost:3000/admin/auth/forgot-password",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Handle successful responses
      if (response?.status===200) {
        toast.success(
          response.data.message ||
            "Password reset link has been sent to your email"
        );

        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (error) {
      // Comprehensive error handling
      if (error.response) {
        
        const errorMessage =
          error.response.data?.message ||
          "An unexpected error occurred while processing your request";

        toast.error(errorMessage);
        
      } else if (error.request) {
        // The request was made but no response was received
        toast.error(
          "No response received from server. Please check your network connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error in sending password reset request");
      }

      console.error("Error in forgot password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
    
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white">
        <div className="flex items-center gap-1">
          <img src={logo} alt="" />
          <span className="text-xl font-semibold">codemy</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Don't have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm font-medium text-[#ff6738] bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden md:block ">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-purple-50 rounded-full ml-[-70px]"></div>
              <img
                src={heroImg}
                alt="Person on rocket illustration"
                className="relative z-10 w-full h-full object-contain mt-16 ml-[-50px]"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="max-w-md mx-auto w-full space-y-6 p-4 lg:mt-[-50px]">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="text-gray-600">
                Please enter your registered email address. We will send you a
                link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(""); // Clear error when user starts typing
                  }}
                  value={email}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back To Sign In
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#ff6738] rounded-lg hover:bg-orange-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
