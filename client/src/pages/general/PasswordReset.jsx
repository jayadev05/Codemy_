import { useState } from "react";
import heroImg from "../../assets/reset.png";
import logo from "../../assets/logo_cap.png";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-hot-toast";
import axios from "axios";
import axiosInstance from "@/config/axiosConfig";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { token } = useParams();

  const PASSWORD_REGEX =
    /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const validateform = () => {
    const newErrors = {};
    if (!password.trim()) newErrors.password = "Password is required";
    else if (!PASSWORD_REGEX.test(password))
      newErrors.password =
        "Password should be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol";

    if (!confirmPassword.trim())
      newErrors.confirmPassword = "Confirm password is required";
    else if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateform()) return;

    try {
      const response = await axiosInstance.post(
        `http://localhost:3000/admin/reset-password/${token}`,
        { password }
      );

      toast.success(
        "Password reset successfull , You can login with your new password. "
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.log(error.message);
      toast.error("An error occured, Please try again.");
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
          <span className="text-sm text-gray-600">Don't have account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm font-medium text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden md:block">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-purple-50 rounded-full ml-[-120px] mt-10"></div>
              <img
                src={heroImg}
                alt="Person with key illustration"
                className="relative z-10 w-[450px] object-contain ml-[-40px] mt-16"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="max-w-md mx-auto w-full space-y-6 p-4 mt-16">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Reset your password
              </h1>
              <p className="text-gray-600">
                Enter your new password below. Make sure it's strong and unique.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className={`w-full rounded-md border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <i
                      className={`ri-${showPassword ? "eye" : "eye-off"}-line`}
                    ></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Create password"
                    className={`w-full rounded-md border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } px-3 py-2 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <i
                      className={`ri-${showPassword ? "eye" : "eye-off"}-line`}
                    ></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-[#ff6738] rounded-lg hover:bg-orange-600 transition-colors"
              >
                Reset Password
              </button>
            </form>

            <div className="text-center">
              <a
                onClick={() => navigate("/login")}
                className="text-sm text-orange-500 hover:underline cursor-pointer"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
