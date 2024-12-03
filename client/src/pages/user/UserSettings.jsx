import React, { useState } from 'react'
import { Heart, Search, ShoppingCart, Eye, EyeOff, Camera } from 'lucide-react'
import defProfile from '../../assets/user-profile.png'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/userSlice'
import axios from 'axios';
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router'

const MainHeader = () => {
  return (
    <header className="bg-white shadow-md py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-orange-500">Codemy</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="What do you want to learn..."
              className="pl-10 pr-4 py-2 w-64 sm:w-80 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {[Search, Heart, ShoppingCart].map((Icon, index) => (
            <button key={index} className="p-1.5 hover:bg-gray-100 rounded-full transition duration-300">
              <Icon size={20} className="text-gray-600 hover:text-orange-500" />
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

const UserProfile = () => {
  const user = useSelector(selectUser);
  console.log(user)

  return (
    <div className="bg-rose-50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img crossOrigin="anonymous" referrerPolicy="no-referrer" src={user?.profileImg || defProfile} className='w-16 h-16 rounded-full border-2 border-white shadow-md' alt="" />
            <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-semibold shadow-sm">
            Become Instructor →
          </button>
        </div>
      </div>
    </div>
  )
}

const Tabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { label: 'Courses', path: '/user/profile' },
    { label: 'Message', path: '/user/messages' },
    { label: 'Wishlist', path: '/user/wishlist' },
    { label: 'Purchase History', path: '/user/purchases' },
    { label: 'Settings', path: '/user/settings' },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.path)}
                className={`px-4 py-3 text-sm ${
                  isActive
                    ? 'text-orange-500 border-b-2 border-orange-500 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                } transition duration-300`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SettingsForm = () => {

  const user = useSelector(selectUser);
  const PASSWORD_REGEX = /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
 

  const [profileImage, setProfileImage] = useState(null);
  const [showCurrentPass, setCurrentPass] = useState(false);
  const [showNewPass, setNewPass] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, lastName] = user.fullName.split(" ");

  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Image size should be under 3MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobile: formData.mobile,
        email: formData.email,
        profileImage
      };

      const response = await axios.put('http://localhost:3000/user/update-profile', payload);

      if (response.data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while updating profile.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    

    if(!PASSWORD_REGEX.test(formData.newPassword)){
      toast.error("Please enter a valid password , with one uppercase , lowercase , digit etc");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password do not match.");
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
                src={ user?.profileImage || defProfile}
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
              name="mobile"
              value={formData.mobile}
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
                required
              />
              <button
                type="button"
                onClick={() => setCurrentPass(!showCurrentPass)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showCurrentPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
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
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setNewPass(!showNewPass)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
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
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition duration-300"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
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
  );
};

export default function SettingsPage() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header/>
      <MainHeader />
      <main className="flex-grow">
        <UserProfile />
        <Tabs />
        <SettingsForm />
      </main>
      <Footer />
    </div>
  )
}

