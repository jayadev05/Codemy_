import React, { useState } from 'react'
import {  Eye, EyeOff, Camera } from 'lucide-react'
import defProfile from '../../assets/user-profile.png'
import { useDispatch, useSelector } from 'react-redux'
import { addUser, selectUser } from '../../store/userSlice'
import axios from 'axios';
import Header from '../../components/layout/Header'
import { toast } from 'react-toastify'
import MainHeader from '../../components/layout/user/MainHeader'
import UserProfile from '../../components/layout/user/UserDetails'
import Tabs from '../../components/layout/user/Tabs'




const SettingsForm = () => {

  const user = useSelector(selectUser);
  
 const dispatch=useDispatch();

  const [profileImg, setProfileImage] = useState(null);
  const [showCurrentPass, setCurrentPass] = useState(false);
  const [showNewPass, setNewPass] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors,setErrors]=useState({})
  const [firstName, lastName] = user.fullName.split(" ");

  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const PASSWORD_REGEX = /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const newErrors = {};
  
    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPass = "Current password is required";
    }
    else if (!PASSWORD_REGEX.test(formData.currentPassword)) {
      newErrors.currentPass = "Password will contain at least one uppercase, lowercase, digit, and special character";
    }
  
    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPass = "New password is required";
    } else if (!PASSWORD_REGEX.test(formData.newPassword)) {
      newErrors.newPass = "Password must contain at least one uppercase, lowercase, digit, and special character";
    }
  
    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPass = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPass = "Passwords do not match";
    }
  
    setErrors(newErrors);
    console.log(errors);
    
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  function resizeImage(file, size = 800) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
  
          const ctx = canvas.getContext('2d');
          
          // Calculate crop dimensions
          const sourceWidth = img.width;
          const sourceHeight = img.height;
          const sourceAspect = sourceWidth / sourceHeight;
          
          let drawWidth, drawHeight, sx, sy;
          
          if (sourceAspect > 1) {
            // Landscape
            drawHeight = sourceHeight;
            drawWidth = drawHeight * 1;
            sx = (sourceWidth - drawWidth) / 2;
            sy = 0;
          } else {
            // Portrait
            drawWidth = sourceWidth;
            drawHeight = drawWidth;
            sx = 0;
            sy = (sourceHeight - drawHeight) / 2;
          }
  
          // Draw the cropped and scaled image
          ctx.drawImage(
            img, 
            sx, sy, drawWidth, drawHeight,  // Source rectangle
            0, 0, size, size  // Destination rectangle
          );
  
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.7);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Image size should be under 3MB');
        return;
      }
  
      try {
        const resizedBlob = await resizeImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(resizedBlob);
      } catch (error) {
        toast.error('Image processing failed');
      }
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        profileImg:profileImg
      };

      const response = await axios.put('http://localhost:3000/user/update-profile', payload );

      

      if (response.status===200) {
        const updatedUser=response.data.updatedUser;
        toast.success("Profile updated successfully!");
        dispatch(addUser(updatedUser));
      } 
      else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error:", error);
      if(error.response){
        toast.error(error.response.data.message || "An Error accoured while trying to update profile , Please try again.")
      }
      toast.error(error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    
    if (!validateForm()) {
      return; 
    }
   
    
    try {
        const payload = {
            email: user.email,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        };
        axios.defaults.withCredentials = true; 
        const response = await axios.put(
            'http://localhost:3000/user/change-password', payload
           
        );
        
        toast.success("Password changed successfully!");
        setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }));
        
    } catch (error) {
        // Detailed error handling
        if (error.response) {
            const errorMessage = error.response.data.message || 
                                 "Failed to change password";
            
            console.error("Error details:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
            
            toast.error(errorMessage);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            toast.error("No response from server. Please check your connection.");
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error setting up request:", error.message);
            toast.error("An unexpected error occurred");
        }
    }
};

  return (
    <>
    <div className="container mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <form 
          onSubmit={handleSaveChanges}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Account Settings</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative w-20 h-20">
              <img
                src={ user?.profileImg || defProfile}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-2 border-orange-500 shadow-sm"
              />
              <label 
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-sm"
              >
                <Camera size={14} />
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-700">Profile Picture</p>
              <p className="text-xs text-gray-500">Max 3MB, 1:1 ratio</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-semibold shadow-sm"
          >
            Save Profile
          </button>
        </form>

        <form 
          onSubmit={handlePasswordChange}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Change Password</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 pr-10"
             
              />
              <button
                type="button"
                onClick={() => setCurrentPass(!showCurrentPass)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showCurrentPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.currentPass && <p className="text-red-500 text-xs mt-1">{errors.currentPass}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 pr-10"
              
              />
              <button
                type="button"
                onClick={() => setNewPass(!showNewPass)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.newPass && <p className="text-red-500 text-xs mt-1">{errors.newPass}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300 pr-10"
             
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.confirmPass && <p className="text-red-500 text-xs mt-1">{errors.confirmPass}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-semibold shadow-sm"
          >
            Change Password
          </button>
        </form>
        
      </div>
      
      
    </div>
    <footer className="bg-white mt-auto fixed bottom-0 right-0 left-0 ">
    <div className=" mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 mb-2 sm:mb-0">© 2021 - Eduguard. Designed by Templatecookie. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            FAQs
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            Terms & Condition
          </a>
        </div>
      </div>
    </div>
  </footer>
  </>
  );
};

export default function SettingsPage() {

  
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <MainHeader />
      <main className="flex-grow">
        <UserProfile />
        <Tabs />
        <SettingsForm />
      </main>
      
    </div>
  )
}

