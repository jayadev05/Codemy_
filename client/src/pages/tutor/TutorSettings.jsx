import React, { useState, FormEvent } from "react";
import { Bell, Camera, ChevronDown, Search } from "lucide-react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addTutor, selectTutor } from "../../store/slices/tutorSlice";
import { toast } from "react-hot-toast";
import defProfile from "../../assets/user-profile.png";
import axiosInstance from "@/config/axiosConfig";
import TutorHeader from "@/components/layout/tutor/TutorHeader";

export default function TutorSettings() {
  const tutor = useSelector(selectTutor);

  const dispatch = useDispatch();

  // State objects for Personal Information and Password Change
  const [personalInfo, setPersonalInfo] = useState({
    firstName: tutor.fullName.split(" ")[0] || "",
    lastName: tutor.fullName.split(" ")[1] || "",
    userName: tutor.userName || "",
    profileImg: tutor.profileImg || "",
    phone: tutor.phone || "",
    jobTitle: tutor.jobTitle || "",
    bio: tutor.bio || "",
    email: tutor.email || "",
  });

  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    email: tutor.email,
  });

  const [previewImg, setPreviewImg] = useState("");
  const [errors, setErrors] = useState({});

  const PASSWORD_REGEX =
    /^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const NAME_REGEX = /^[a-zA-Z\s]{3,15}$/;
  const USERNAME_REGEX = /^(?!.*_{2,})[a-zA-Z0-9_]{5,16}$/;

  // form validation
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordChange.newPassword.trim())
      newErrors.newPass = "This Field is required";
    else if (!PASSWORD_REGEX.test(passwordChange.newPassword))
      newErrors.newPass =
        "Password should be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol";

    if (!passwordChange.currentPassword.trim())
      newErrors.currentPass = "This Field is required";
    else if (!PASSWORD_REGEX.test(passwordChange.currentPassword))
      newErrors.currentPass =
        "Password will be at least 6 characters long, include one uppercase, one lowercase, one digit, and a symbol";

    if (!passwordChange.confirmPassword.trim())
      newErrors.confirmPass = "This Field is required";
    else if (passwordChange.newPassword !== passwordChange.confirmPassword)
      newErrors.confirmPass = "Passwords do not match";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateInfoForm = () => {
    const newErrors2 = {};

    if (!personalInfo.bio.trim())
      newErrors2.bio = "Please fill this field before saving changes";
    else if (personalInfo.bio.length < 10)
      newErrors2.bio = "Please enter atleast 10-30 characters for bio";

    if (!personalInfo.jobTitle.trim())
      newErrors2.title = "Please fill this field before saving changes";

    if (!personalInfo.lastName.trim())
      newErrors2.lastname = "Lastname is required";

    if (!personalInfo.phone)
      newErrors2.phone = "Please add a phone number before saving changes";

    if (!USERNAME_REGEX.test(personalInfo.userName.trim())) {
      newErrors2.username =
        "Username must be 5-16 characters, alphanumeric or underscore";
    }

    if (!personalInfo.firstName.trim()) {
      newErrors2.firstname = "Firstname is required";
    } else if (!NAME_REGEX.test(personalInfo.firstName.trim())) {
      newErrors2.firstname = "Please enter a valid firstname";
    }

    console.log(newErrors2);
    setErrors(newErrors2);
    return Object.keys(newErrors2).length === 0;
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
        setPersonalInfo((prev) => ({ ...prev, profileImg: fileUrl }));

        setPreviewImg(fileUrl);
      }

      e.target.value = null;
    } catch (error) {
      console.log(error);
      toast.error("Error uploading thumbnail");
    }
  };

  // Handler for personal info input changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for password change input changes
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordChange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Personal Information Form Submit Handler
  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();

    // First, validate the form
    if (!validateInfoForm()) return;

    try {
      // Check for existing phone or username
      const existCheck = await axiosInstance.post("/admin/auth/check-mail", {
        phone: personalInfo.phone,
        username: personalInfo.userName,
        userId: tutor._id,
      });

      const { phoneExists, userNameExists } = existCheck.data;

      // Create an object to store validation errors
      const validationErrors = {};

      // Check phone existence

      if (phoneExists) {
        validationErrors.phone =
          "This phone number is already registered to another user";
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

      // If no validation errors, proceed with update
      const response = await axiosInstance.put("/tutor/profile", personalInfo);

      // Success handling
      toast.success(response.data.message || "Details Updated successfully", {
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
      setPreviewImg("");

      // Update global state with new tutor data
      dispatch(addTutor(response.data.updatedTutor));
    } catch (error) {
      // Comprehensive error handling
      console.error("Update process error:", error);

      // Check if it's a response error
      if (error.response) {
        toast.error(error.response.data.message || "Error updating profile", {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
      } else if (error.request) {
        toast.error("No response from the server. Please try again.", {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
      } else {
        toast.error("An unexpected error occurred", {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
      }
    }
  };

  // Password Change Form Submit Handler
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    try {
      const response = await axiosInstance.put("/tutor/password", {
        passwordChange,
      });
      toast.success(response.data.message || "Password changed successfully", {
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        // Server responded with a status code other than 2xx
        const errorMessage =
          error.response.data.message ||
          "An error occurred while changing the password";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
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
        <Sidebar activeSection="Settings and profile" />
      </div>

      {/* Main content */}
      <main className="flex-grow overflow-x-hidden">
        {/* Header - Now full width */}
        <TutorHeader heading="Settings and Profile" />

        {/* Settings content - Now with responsive padding */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Personal Information Form */}
          <form
            onSubmit={handlePersonalInfoSubmit}
            className="bg-white shadow rounded-lg mb-6"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Account Settings
              </h3>
              <div className="mt-4 flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <img
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    src={
                      previewImg ? previewImg : tutor?.profileImg || defProfile
                    }
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
                  <p className="font-medium text-gray-700">
                    Profile Picture{" "}
                    {previewImg ? (
                      <span className="text-orange-500 ms-2">(preview)</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-500">Max 3MB, 1:1 ratio</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.firstname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstname}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.lastname && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastname}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.bio && (
                    <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
                  )}
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
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
          <form
            onSubmit={handlePasswordChangeSubmit}
            className="bg-white shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Change Password
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.currentPass && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.currentPass}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.newPass && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.newPass}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  {errors.confirmPass && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPass}
                    </p>
                  )}
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
              <p className="text-sm text-gray-500 mb-2 sm:mb-0">
                © 2021 - Eduguard. Designed by Templatecookie. All rights
                reserved.
              </p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  FAQs
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Terms & Condition
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
