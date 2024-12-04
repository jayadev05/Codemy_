import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../assets/logo_cap.png";
import signUpBG from "../../../assets/signup_illustration.png";
import google_logo from '../../../assets/google_icon.png';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmailVerify from "./emailVerify";
import { useDispatch } from 'react-redux';
import { addUser } from '../../../store/userSlice'

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState({});

  // Validation Regex Patterns
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
const NAME_REGEX = /^[a-zA-Z\s]{5,50}$/;
const USERNAME_REGEX = /^(?!.*_{2,})[a-zA-Z0-9_]{5,16}$/;

const validateForm = () => {
  const newErrors = {};

  // First Name Validation
  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required';
  } else if (!NAME_REGEX.test(formData.firstName.trim())) {
    newErrors.firstName = 'First name must be 5 letters, no symbols';
  }

  // Last Name Validation
  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
  }
  else if(!/^[a-zA-Z]$/.test(formData.lastName)) newErrors.lastName ="only letters are allowed"

  // Username Validation
  if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  } else if (!USERNAME_REGEX.test(formData.username.trim())) {
    newErrors.username = 'Username must be 5-16 characters, alphanumeric or underscore';
  }

  // Email Validation
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(formData.email)) {
    newErrors.email = 'Enter a valid Email';
  }

  // Password Validation
  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (!PASSWORD_REGEX.test(formData.password)) {
    newErrors.password = "Password should be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol";
  }

  // Confirm Password Validation
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  // Terms Acceptance Validation
  if (!formData.termsAccepted) {
    newErrors.terms = 'You must accept the terms and conditions';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }

    try {
      setIsLoading(true);

      // First, check if email already exists
      const checkEmailResponse = await axios.post('http://localhost:3000/admin/check-mail', {
        email: formData.email,
        username:formData.username
      });

      console.log(checkEmailResponse.data

      )
      // If email or username exists, show error and stop further process
      const { emailExists, userNameExists } = checkEmailResponse.data;

      // Set both errors if applicable
      if (emailExists || userNameExists) {
        setErrors(prev => ({
          ...prev,
          email: emailExists ? 'Email is already registered' : null,
          username: userNameExists ? 'Username is already in use' : null
        }));
        return;
      }
      

      const response = await axios.post('http://localhost:3000/user/sendotp', {
        email: formData.email
      });
      
      if (response.data.success) {
        setOtpSent(true);
        setIsModalVisible(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      setIsLoading(true);
      await handleSendOtp();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleResponse = async (authResult) => {
    try {
      setIsLoading(true);
      
      if (authResult.code) {
        const response = await axios.post('http://localhost:3000/user/google', {
          code: authResult.code
        });

        if (response.data.success) {
          
          dispatch(addUser(response.data.data.user));
          toast.success('Google Sign-in Successful!');
          
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      toast.error(error.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleResponse,
    onError: (error) => {
      console.error('Google Login Error:', error);
      toast.error('Failed to connect with Google. Please try again.');
      setIsLoading(false);
    },
    flow: 'auth-code'
  });


  return (
    <div className="flex min-h-screen flex-col bg-[#F8F7FF]">
     
     {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}
      <header className="flex justify-around items-center mb-8">
        <div  className="text-3xl font-bold text-gray-700 flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-8 mr-2 mt-2" />
          Codemy
        </div>
        <div>
          <span className="text-gray-500 mr-2">Already have an account?</span>
          <button onClick={() => navigate('/login')} className="text-orange-500 font-semibold hover:underline">
            Sign In
          </button>
        </div>
      </header>
      
      <main className="flex flex-grow grid-cols-2">
        <div className="hidden lg:block lg:w-[1300px] lg:h-[720px]">
          <img src={signUpBG} alt="Decorative sign up illustration" className="h-full w-full object-cover" />
        </div>
        
        <div className="flex items-center justify-center p-4 w-full">
          <div className="w-full max-w-md space-y-6">
            <h1 className="text-center text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name..."
                    className={`w-full rounded-md border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name..."
                    className={`w-full rounded-md border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username..."
                  className={`w-full rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                 
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className={`w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <i className={`ri-${showPassword ? "eye" : "eye-off"}-line`}></i>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <i className={`ri-${showConfirmPassword ? "eye" : "eye-off"}-line`}></i>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="terms" className="text-sm text-gray-500">
                  I agree with all of your{" "}
                  <a href="#" className="text-orange-500 hover:text-orange-600">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}

              <button
            
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:bg-orange-300"
              >
             Create Account
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F8F7FF] px-2 text-gray-500">Sign up with</span>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  className="flex w-50 items-center justify-around rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <img src={google_logo} alt="" className='w-[25px]'/>
                  <span className="ml-2 border-l-2 pl-2">Google</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {isModalVisible && <EmailVerify formData={formData} setIsModalVisible={setIsModalVisible} />}
    </div>
  );
}