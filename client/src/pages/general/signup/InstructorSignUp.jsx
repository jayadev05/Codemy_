import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/userSlice';
import axiosInstance from '@/config/axiosConfig';

export function InstructorModal({ onClose }) {

  const FULLNAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+|\s[A-Z]\.?)+$/;

  const user=useSelector(selectUser);

  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email:user.email,
    phone: '',
    field:'',
    experience: '',
    certificates: null
  });

  // State for form errors and submission status
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    else if (!FULLNAME_REGEX.test(formData.fullName)) {
      newErrors.fullName = 'Please Enter a real name with atleast 5 characters';
    }
  
    // Phone Validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    else if(!/^(?!0{10}$)\d{10}$/.test(formData.phone)) newErrors.phone="Enter a valid mobile number"

    if(!formData.experience.trim()) newErrors.experience="Experience is a must"
    else if(formData.experience.trim().length<10) newErrors.experience="Enter atleast 10-20 characters"

    if(!formData.field.trim()) newErrors.field="Please Enter your field of expertise"

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [type === 'file' ? name : name]: type === 'file' ? files : value
    }));
  };


  // Submit application handler
  const submitInstructorApplication = async (e) => {
    e.preventDefault();
    
    // Validate form
   if(!validateForm()) {
    return
   };
    
   
    setIsSubmitting(true);
  
    try {
      // Prepare form data
      const formSubmission = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'certificates' && value) {
          Array.from(value).forEach(file => {
            formSubmission.append('certificates', file);
          });
        } else if (key !== 'certificates') {
          formSubmission.append(key, value || '');
        }
      });
  
      // Submit application
      await axiosInstance.post(
        'http://localhost:3000/admin/instructor-applications', 
        formSubmission,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      toast.success('Application submitted successfully!');
      onClose();
    } catch (error) {
      // Comprehensive error handling
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.errors || 
                           'Application submission failed';
      
      toast.error(errorMessage);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Become A Codemy Instructor
          </h2>

          {/* Form */}
          <form onSubmit={submitInstructorApplication} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && (
                <span className="text-red-500 text-sm">
                  {errors.fullName}
                </span>
              )}
            </div>
            
            

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Expertise Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
               Field of Expertise
              </label>
              <input
                type="text"
                id="field"
                name="field"
                value={formData.field}
                onChange={handleInputChange}
                placeholder="Enter you field of expertise"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.field && (
                <span className="text-red-500 text-sm">
                  {errors.field}
                </span>
              )}
            </div>

            {/* Experience Textarea */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Enter your teaching or professional experience "
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            {errors.experience && (
                <span className="text-red-500 text-sm">
                  {errors.experience}
                </span>
              )}

            {/* Certificates Upload */}
            <div>
              <label htmlFor="certificates" className="block text-sm font-medium text-gray-700 mb-1">
                Certificates (optional)
              </label>
              <div className="mt-1 flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md">
                <span className="text-sm text-gray-500">
                  {formData.certificates 
                    ? `${formData.certificates.length} file(s) selected` 
                    : 'Upload relevant certificates'}
                </span>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-5 w-5 text-gray-400" />
                </label>
                <input 
                  id="file-upload" 
                  name="certificates" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleInputChange}
                  multiple
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              {!isSubmitting && (
                <svg 
                  className="w-4 h-4 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}