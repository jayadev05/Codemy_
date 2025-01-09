import React, { useState } from "react";
import { Eye, EyeOff, Camera, SpaceIcon } from "lucide-react";
import defProfile from "../../assets/user-profile.png";
import { useDispatch, useSelector } from "react-redux";
import { addUser, selectUser } from "../../store/slices/userSlice";
import axios from "axios";
import Header from "../../components/layout/Header";
import { toast } from "react-hot-toast";
import MainHeader from "../../components/layout/user/MainHeader";
import UserProfile from "../../components/layout/user/UserDetails";
import Tabs from "../../components/layout/user/Tabs";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import { selectWishlist } from "../../store/slices/wishlistSlice";
import { selectCart } from "../../store/slices/cartSlice";
import axiosInstance from "@/config/axiosConfig";

const SettingsForm = () => {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);

  const dispatch = useDispatch();

  const [profileImg, setProfileImage] = useState(null);
  const [previewImg, setPreviewImg] = useState("");
  const [showCurrentPass, setCurrentPass] = useState(false);
  const [showNewPass, setNewPass] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [firstName, lastName] = user.fullName.split(" ");

  const [formData, setFormData] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    userName: user.userName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const NAME_REGEX = /^[a-zA-Z\s]{3,50}$/;
  const USERNAME_REGEX = /^(?!.*_{2,})[a-zA-Z0-9_]{5,16}$/;

  const validateForm = () => {
    const PASSWORD_REGEX =
      /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    const newErrors = {};

    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPass = "Current password is required";
    } else if (!PASSWORD_REGEX.test(formData.currentPassword)) {
      newErrors.currentPass =
        "Password will contain at least one uppercase, lowercase, digit, and special character";
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPass = "New password is required";
    } else if (!PASSWORD_REGEX.test(formData.newPassword)) {
      newErrors.newPass =
        "Password must contain at least one uppercase, lowercase, digit, and special character";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function resizeImage(file, size = 800) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext("2d");

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
            sx,
            sy,
            drawWidth,
            drawHeight, // Source rectangle
            0,
            0,
            size,
            size // Destination rectangle
          );

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  const handleFileUploadToCloudinary = async (file, fileType = "image") => {
    try {
      const cloudName = "diwjeqkca";
      const uploadPreset = "unsigned_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Cloudinary upload error:", {
          status: res.status,
          statusText: res.statusText,
          errorDetails: errorText,
        });
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log("Full Cloudinary response:", data);

      // For PDFs, always use Google Docs viewer
      if (fileType === "file") {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(
          data.secure_url
        )}&embedded=true`;
      }

      return data.secure_url;
    } catch (error) {
      console.error("Detailed Cloudinary upload error:", error);
      alert("File upload failed. Please try again.");
      return null;
    }
  };

  const handleImageUpload = async (e, fileType = "image") => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    // Validation options for different file types
    const validationOptions = {
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        maxSizeLabel: "10 MB",
      },
      // Add more file type configurations as needed
    };

    const options = validationOptions[fileType] || validationOptions.image;
    const { maxSize, allowedTypes, maxSizeLabel } = options;

    // File size check
    if (file.size > maxSize) {
      alert(`File size should be less than ${maxSizeLabel}`);
      e.target.value = null; // Reset file input
      return;
    }

    // File type check
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
      e.target.value = null; // Reset file input
      return;
    }

    try {
      const resizedFile = await resizeImage(file);
      const fileUrl = await handleFileUploadToCloudinary(resizedFile, fileType);

      if (fileUrl) {
        setProfileImage(fileUrl);

        setPreviewImg(fileUrl);
      }

      e.target.value = null;
    } catch (error) {
      console.log(error);
      toast.error("Error uploading thumbnail");
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName,
        phone: formData.phone,
        email: formData.email,
        profileImg: profileImg,
      };

      const existCheck = await axiosInstance.post(
        "http://localhost:3000/admin/auth/check-mail",
        {
          phone: payload.phone,
          username: payload.userName,
          userId: user._id,
        }
      );

      const { phoneExists, userNameExists } = existCheck.data;

      // Create an object to store validation errors
      const validationErrors = {};

      // First Name Validation
      if (!formData.firstName.trim()) {
        validationErrors.firstName = "First name is required";
      } else if (!NAME_REGEX.test(formData.firstName.trim())) {
        validationErrors.firstname =
          "First name must be at least 3 letters, no symbols";
      }

      // Phone Validation
      if (!formData.phone) {
        validationErrors.phone = "Phone number is required";
      } else if (!/^(?!0{10}$)\d{10}$/.test(formData.phone))
        validationErrors.phone = "Enter a valid mobile number";

      // Last Name Validation
      if (!formData.lastName.trim()) {
        validationErrors.lastname = "Last name is required";
      }

      // Check phone existence

      if (phoneExists) {
        validationErrors.phone =
          "This phone number is already registered to another user";
      }

      // Username Validation
      if (!formData.userName.trim()) {
        validationErrors.username = "Username is required";
      } else if (!USERNAME_REGEX.test(formData.userName.trim())) {
        validationErrors.username =
          "Username must be 5-16 characters, alphanumeric or underscore";
      }
      // Check username existence

      if (userNameExists) {
        validationErrors.username = "Username already in use";
      }

      // If there are any validation errors, stop the process
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const response = await axiosInstance.put(
        "http://localhost:3000/user/profile",
        payload
      );

      if (response.status === 200) {
        const updatedUser = response.data.updatedUser;
        toast.success("Profile updated successfully!");
        setErrors({});
        setPreviewImg("");
        dispatch(addUser(updatedUser));
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response) {
        toast.error(
          error.response.data.message ||
            "An Error accoured while trying to update profile , Please try again."
        );
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
      const response = await axiosInstance.put(
        "http://localhost:3000/user/password",
        payload
      );

      toast.success("Password changed successfully!");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      // Detailed error handling
      if (error.response) {
        const errorMessage =
          error.response.data.message || "Failed to change password";

        console.error("Error details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
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
            className="bg-white p-6 rounded-xl shadow-md space-y-4 mb-12"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Account Settings
            </h3>

            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20">
                <img
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  src={previewImg ? previewImg : user?.profileImg || defProfile}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full border-2 border-orange-500 shadow-sm"
                />
                {previewImg ? <span>preview</span> : null}
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
                <p className="font-medium text-gray-700">
                  Profile Picture
                  {previewImg ? (
                    <span className="text-orange-500 ms-2">(preview)</span>
                  ) : null}
                </p>
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
                {errors.firstname && (
                  <span className="text-red-500 mt-3 text-sm">
                    {errors.firstname}
                  </span>
                )}
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
                {errors.lastname && (
                  <span className="text-red-500 mt-3 text-sm">
                    {errors.lastname}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="user name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
                  required
                />
                {errors.username && (
                  <span className="text-red-500 mt-3 text-sm">
                    {errors.username}
                  </span>
                )}
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
              {errors.phone && (
                <span className="text-red-500 mt-3 text-sm">
                  {errors.phone}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
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
            className="bg-white p-6 rounded-xl shadow-md space-y-4 mb-12"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Change Password
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
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
              {errors.currentPass && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPass}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
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
              {errors.newPass && (
                <p className="text-red-500 text-xs mt-1">{errors.newPass}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
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
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPass && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPass}
                </p>
              )}
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
      <SecondaryFooter />
    </>
  );
};

export default function SettingsPage() {
  const wishlist = useSelector(selectWishlist);
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <MainHeader />
      <main className="flex-grow">
        <Tabs />
        <SettingsForm />
      </main>
    </div>
  );
}
