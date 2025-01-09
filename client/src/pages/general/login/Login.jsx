import React, { useState } from "react";
import axios from "axios";
import logo from "../../../assets/logo_cap.png";
import illustration from "../../../assets/login_ill.png";
import google_logo from "../../../assets/google_icon.png";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addUser, selectUser } from "../../../store/slices/userSlice";
import { useGoogleLogin } from "@react-oauth/google";
import { addTutor } from "../../../store/slices/tutorSlice";
import { addAdmin } from "../../../store/slices/adminSlice";
import axiosInstance from "../../../config/axiosConfig";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/user/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { userData, userType, accessToken,refreshToken, redirectUrl } = response.data;

        // Check if the user is active before proceeding
        if (userData.isActive === false) {
          toast.error("Your account is blocked. Please contact support.",{style: {
            borderRadius: '10px',
            background: '#111826',
            color: '#fff',
          }});
          setIsLoading(false);
          return;
        }
        // Dispatch based on user type
        switch (userType) {
          case "admin":
            dispatch(addAdmin(userData));

            console.log("dispatched admin", userData);
            break;
          case "user":
            dispatch(addUser(userData));
            console.log("dispatched user");
            break;
          case "tutor":
            // Ensure you have a tutorSlice with addTutor action
            dispatch(addTutor(userData));
            console.log("dispatched tutor");
            break;
          default:
            console.warn("Unknown user type:", userType);
        }

        localStorage.setItem('accessToken',accessToken);
        localStorage.setItem('refreshToken',refreshToken);

        toast.success("Log In Successfull!",{style: {
          borderRadius: '10px',
          background: '#111826',
          color: '#fff',
        }});
    
          navigate(redirectUrl || "/");
       
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",{style: {
          borderRadius: '10px',
          background: '#111826',
          color: '#fff',
        }}
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (authResult) => {
    try {
      setIsLoading(true);

      if (authResult.code) {
        const response = await axiosInstance.post("http://localhost:3000/user/login/google", {
          code: authResult.code,
        });

       
      
        if(response.data.data.CurrentUser?.isActive===false){
          setIsLoading(false);
          toast.error("Your account is blocked. Please contact support",{style: {
            borderRadius: '10px',
            background: '#111826',
            color: '#fff',
          }});
          return
        }

        if (response.data.success) {

        

          const accessToken=response.data.data.accessToken;
          const refreshToken=response.data.data.refreshToken;

          localStorage.setItem('accessToken',accessToken);
          localStorage.setItem('refreshToken',refreshToken);
          
          
       
          toast.success("Google Sign-in Successful!",{style: {
            borderRadius: '10px',
            background: '#111826',
            color: '#fff',
          }});

          
          const accType = response.data.data.accType;
          

          if (accType === "admin") {
              
            dispatch(addAdmin(response.data.data.currentUser));
            navigate("/admin/dashboard"); 
            // Redirect to admin dashboard
          } else if(accType==="tutor") {
            dispatch(addTutor(response.data.data.currentUser));
            navigate("/tutor/dashboard"); // Redirect to user/tutor home
          }
          else {
            dispatch(addUser(response.data.data.currentUser));
            navigate("/")
          }

        }
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error(
        error.response?.data?.message ||
          "Google sign-in failed. Please try again.",{style: {
            borderRadius: '10px',
            background: '#111826',
            color: '#fff',
          }}
      );
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleResponse,
    onError: (error) => {
      console.error("Google Login Error:", error);
      toast.error("Failed to connect with Google. Please try again.");
      setIsLoading(false); // Make sure to handle loading state on error
    },
    flow: "auth-code",
  });

  return (
    <>
     
      <header className="flex justify-around items-center pb-4 dark:bg-slate-800">
        <div className="text-3xl font-bold text-gray-700 flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-8 mr-2 mt-2 " />
          <h2 className="dark:text-white text-[1.5rem]">Codemy</h2>
        </div>
        <div>
          <span className="text-gray-500 dark:text-white mr-2">Don't have an account?</span>
          <button
            onClick={() => navigate("/signup")}
            className="text-orange-500 font-semibold hover:underline"
          >
            Create Account
          </button>
        </div>
      </header>

      <div className="flex flex-grow grid-cols-2 bg-white pt-8 dark:bg-[#1d2026]">
        <div className="hidden lg:flex w-1/2 items-center justify-center">
          <div className="w-3/4">
            <img src={illustration} alt="Illustration" className="mx-auto" />
          </div>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-1/2 p-10 relative">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Sign in to your account
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-600 dark:text-white mb-2">Email</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Username or email address..."
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-white mb-2">Password</label>
                <div className="relative">
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none dark:bg-slate-800  focus:border-orange-400"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer"
                  >
                    <i
                      className={`ri-${showPassword ? "eye" : "eye-off"}-line`}
                    ></i>
                  </span>
                </div>
                <div className="flex justify-end">
                  <a
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-[#ff6738] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-gray-600 dark:text-white">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-[#ff6738] text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="mt-3 text-center text-gray-500 dark:text-white">or</div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase mt-3 mb-4">
                <span className="bg-[#F8F7FF] px-2 text-gray-500 dark:text-white dark:bg-gray-600">
                  Sign In with
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center mt-2">
              <button
                onClick={() => !isLoading && googleLogin()}
                type="button"
                disabled={isLoading}
                className="flex w-50 items-center justify-around rounded-md border border-gray-300 bg-white dark:bg-[#1d2026] dark:text-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <img src={google_logo} alt="" className="w-[25px]" />
                <span className="ml-2 border-l-2 pl-2">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
