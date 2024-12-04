import React, { useState, FormEvent } from 'react'
import { Bell, Camera, ChevronDown, Search } from 'lucide-react'
import Sidebar from '../../components/layout/tutor/Sidebar'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { addTutor, selectTutor } from '../../store/tutorSlice';
import { toast } from 'react-toastify';
import defProfile from "../../assets/user-profile.png"

export default function TutorSettings() {

  const tutor=useSelector(selectTutor);
  const dispatch=useDispatch();

  // State objects for Personal Information and Password Change
  const [personalInfo, setPersonalInfo] = useState({
    firstName: tutor.fullName.split(' ')[0] || '',
    lastName: tutor.fullName.split(' ')[1] || '',
    userName: tutor.userName || '',
    profileImg:tutor.profileImg|| '',
    phone: tutor.phone || '',
    jobTitle: tutor.jobTitle || '',
    bio: tutor.bio || '',
    email: tutor.email || '',
    
  });

  

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email:tutor.email
  })

  const[errors,setErrors]=useState({});
  
  
  const PASSWORD_REGEX = /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const NAME_REGEX = /^[a-zA-Z\s]{3,15}$/;
  const USERNAME_REGEX = /^(?!.*_{2,})[a-zA-Z0-9_]{5,16}$/;

  // form validation
  const validatePasswordForm=()=>{
    const newErrors={};

    if(!passwordChange.newPassword.trim()) newErrors.newPass="This Field is required"
    else if(!PASSWORD_REGEX.test(passwordChange.newPassword)) newErrors.newPass="Password should be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol"

    if(!passwordChange.currentPassword.trim()) newErrors.currentPass="This Field is required"
    else if(!PASSWORD_REGEX.test(passwordChange.currentPassword)) newErrors.currentPass="Password will be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol"


    if(!passwordChange.confirmPassword.trim()) newErrors.confirmPass="This Field is required"
    else if(passwordChange.newPassword!==passwordChange.confirmPassword) newErrors.confirmPass="Passwords do not match"
    setErrors(newErrors);

    return Object.keys(newErrors).length===0;

  }

  const validateInfoForm=()=>{
    const newErrors2={};

    if(!personalInfo.bio.trim()) newErrors2.bio="Please fill this field before saving changes"
    else if(personalInfo.bio.length<10) newErrors2.bio="Please enter atleast 10-30 characters for bio"

    if(!personalInfo.jobTitle.trim()) newErrors2.title="Please fill this field before saving changes"

    if(!personalInfo.lastName.trim()) newErrors2.lastname="Lastname is required"

    if(!personalInfo.phone) newErrors2.phone="Please add a phone number before saving changes"

     if (!USERNAME_REGEX.test(personalInfo.userName.trim())) {
      newErrors2.username = 'Username must be 5-16 characters, alphanumeric or underscore';
    }

      if (!personalInfo.firstName.trim()) {
      newErrors2.firstname = 'Firstname is required';
    }
     else if (!NAME_REGEX.test(personalInfo.firstName.trim())) {
      newErrors2.firstname = 'Please enter a valid firstname';
    }
    

    console.log(newErrors2);
    setErrors(newErrors2);
    return Object.keys(newErrors2).length===0;

  }

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
          setPersonalInfo((prev) => ({
            ...prev,
            profileImg: reader.result,
          }));
        };
        reader.readAsDataURL(resizedBlob);
      } catch (error) {
        toast.error('Image processing failed');
      }
    }
  };
 

  // Handler for personal info input changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
  setPersonalInfo((prev) => ({
    ...prev,
    [name]: value,
  }));
  }

  // Handler for password change input changes
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target
    setPasswordChange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Personal Information Form Submit Handler
  const handlePersonalInfoSubmit = async(e) => {
    e.preventDefault()

    if(!validateInfoForm()) return;


    try {

      const response = await axios.put("http://localhost:3000/tutor/update-profile",  personalInfo ,
       
      );

      toast.success(response.data.message || "Details Updated successfully");
      const updatedTutorData = response.data.updatedTutor;
      dispatch(addTutor(updatedTutorData));

    } catch (error) {
      console.error("Error:", error);
  
    
      if (error.response) {

        const errorMessage = error.response.data.message || "An error occurred while updating details";
        toast.error(errorMessage);

      } else if (error.request) {

        // Request was made, but no response was received
        toast.error("No response from the server. Please try again later.");

      } else {

        // Something happened in setting up the request
        toast.error(error.message || "An unexpected error occurred.");

      }
    }
    
  }

  // Password Change Form Submit Handler
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
  
    if (!validatePasswordForm()) return;
  
    try {
      const response = await axios.put("http://localhost:3000/tutor/change-password", { passwordChange });
      toast.success(response.data.message || "Password changed successfully");
    } catch (error) {
      console.error("Error:", error);
  
    
      if (error.response) {
        // Server responded with a status code other than 2xx
        const errorMessage = error.response.data.message || "An error occurred while changing the password";
        toast.error(errorMessage);
      } else if (error.request) {
        // Request was made, but no response was received
        toast.error("No response from the server. Please try again later.");
      } else {
        // Something happened in setting up the request
        toast.error(error.message || "An unexpected error occurred.");
      }
    }
  };
  

  return (
   


<div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Now using sticky positioning */}
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="Settings and profile"/>
      </div>

      {/* Main content */}
      <main className="flex-grow overflow-x-hidden"> 
        {/* Header - Now full width */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold"> Settings & Profile </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300" placeholder="Search" />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Settings content - Now with responsive padding */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Personal Information Form */}
          <form onSubmit={handlePersonalInfoSubmit} className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
              <div className="mt-4 flex items-center space-x-4">
              <div className="relative w-20 h-20">
              <img
                src={ tutor?.profileImg || defProfile}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-2 border-orange-500  shadow-sm"
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
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    name="userName"
                    id="username"
                    value={personalInfo.userName}
                    onChange={handlePersonalInfoChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your username"
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      id="phoneNumber"
                      value={personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      className="flex-1 block w-full border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your Phone Number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="jobTitle"
                      id="title"
                      value={personalInfo.jobTitle}
                      onChange={handlePersonalInfoChange}
                      className="flex-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your title, profession or small biography"
                    />
                  </div>
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={personalInfo.bio}
                      onChange={handlePersonalInfoChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Write a short description about yourself"
                    />
                  </div>
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="email"
                      name="fixEmail"
                      id="email"
                      value={personalInfo.email}
                      className="flex-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"

                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChangeSubmit} className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={passwordChange.currentPassword}
                      onChange={handlePasswordChangeInput}
                      className="block w-full pr-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Current password"
                    />
                  </div>
                  {errors.currentPass && <p className="text-red-500 text-xs mt-1">{errors.currentPass}</p>}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChangeInput}
                      className="block w-full pr-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="New password"
                    />
                  </div>
                  {errors.newPass && <p className="text-red-500 text-xs mt-1">{errors.newPass}</p>}

                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={passwordChange.confirmPassword}
                      onChange={handlePasswordChangeInput}
                      className="block w-full pr-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                  {errors.confirmPass && <p className="text-red-500 text-xs mt-1">{errors.confirmPass}</p>}

                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Now responsive */}
        <footer className="bg-white mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
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
      </main>
    </div>
  )
}