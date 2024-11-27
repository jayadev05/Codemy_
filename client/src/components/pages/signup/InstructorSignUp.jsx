import React, { useState } from 'react';
import { X, Eye, EyeOff, Upload } from 'lucide-react';
import {toast,ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function InstructorModal({ onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    certificates: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files) {
      setFormData(prev => ({ ...prev, certificates: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  

  const submitInstructorApplication = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const formSubmission = new FormData();
      
      // Ensure all required fields are appended
      formSubmission.append('fullName', formData.fullName.trim());
      formSubmission.append('email', formData.email.trim());
      formSubmission.append('phone', formData.phone.trim());
      formSubmission.append('experience', formData.experience?.trim() || '');
      
      // Append certificates
      if (formData.certificates) {
        Array.from(formData.certificates).forEach(file => {
          formSubmission.append('certificates', file);
        });
      }
  
      const response = await fetch('http://localhost:3000/admin/instructor-applications', {
        method: 'POST',
        body: formSubmission,
      });
  
      
      
      // Check if response body exists before parsing
      const contentType = response.headers.get('content-type');
      let result = {};
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        // If not JSON, try to get text response for debugging
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server did not respond with JSON');
      }
  
      if (response.ok) {
        toast.success('Application submitted successfully!');
        alert('Application submitted successfully!')
        onClose(); // Close modal on successful submission
      } else {
        // Handle specific error messages
        const errorMessage = result.errors 
          ? (Array.isArray(result.errors) ? result.errors.join(', ') : result.errors)
          : (result.message || 'Application submission failed');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error submitting application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
       <ToastContainer/>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
   
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
      
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Become A Codemy Instructor</h2>
          <form onSubmit={submitInstructorApplication} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName}</span>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
            </div>

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
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Enter your teaching or professional experience (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="certificates" className="block text-sm font-medium text-gray-700 mb-1">
                Certificates
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
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
    
  );
}