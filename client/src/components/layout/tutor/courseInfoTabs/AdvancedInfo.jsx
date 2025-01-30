import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { X } from 'lucide-react';
import useCurrencyFormat from '../../../../hooks/UseCurrencyFormat';
import toast from 'react-hot-toast';

function AdvancedInfo({initialData ,sendData,errors}) {

  const [description, setDescription] = useState(initialData?.description || "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || null);
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnail || null);
  const [courseContent, setCourseContent] = useState(initialData?.courseContent || '');
  const [progress, setProgress] = useState(0); 
 
  
    const { 
      value: price, 
      displayValue: formattedPrice, 
      handleChange: handlePriceChange 
  } = useCurrencyFormat(initialData?.price || '');

    
    // function to resize image
    const resizeImage=(file, width = 1200, height = 800)=> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
    
            const ctx = canvas.getContext('2d');
            
            // Calculate scaling and cropping
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            const sourceAspect = sourceWidth / sourceHeight;
            const targetAspect = width / height;
    
            let drawWidth, drawHeight, sx, sy;
    
            if (sourceAspect > targetAspect) {
              // Image is wider than the target aspect ratio
              drawHeight = sourceHeight;
              drawWidth = drawHeight * targetAspect;
              sx = (sourceWidth - drawWidth) / 2;
              sy = 0;
            } else {
              // Image is taller than the target aspect ratio
              drawWidth = sourceWidth;
              drawHeight = drawWidth / targetAspect;
              sx = 0;
              sy = (sourceHeight - drawHeight) / 2;
            }
    
            // Draw the cropped and scaled image
            ctx.drawImage(
              img,
              sx, sy, drawWidth, drawHeight,  // Source rectangle
              0, 0, width, height  // Destination rectangle
            );
    
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.7);
          };
          img.onerror = (error) => {
            reject(error);
          };
          img.src = event.target.result;
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    }

    const convertNumberToWords = (num) => {
      if (num === 0) return "Zero";
  
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
      const convertHundreds = (n) => {
          if (n > 99) {
              return ones[Math.floor(n / 100)] + " Hundred " + (n % 100 !== 0 ? "and " : "") + convertTens(n % 100);
          }
          return convertTens(n);
      };
  
      const convertTens = (n) => {
          if (n < 10) return ones[n];
          if (n < 20) return teens[n - 10];
          return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
      };
  
      const convertThousands = (n) => {
          if (n >= 1000 && n < 100000) {
              return convertHundreds(Math.floor(n / 1000)) + " Thousand " + (n % 1000 !== 0 ? convertHundreds(n % 1000) : "");
          }
          return convertHundreds(n);
      };
  
      return convertThousands(num).trim() + " Rupees";
    };

    const handleFileUploadToCloudinary = async (file, fileType = 'image') => {
      try {
        const cloudName = 'diwjeqkca';
        const uploadPreset = 'unsigned_upload';
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
    
        
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
         
        });
    
     
    
        // For PDFs, always use Google Docs viewer
        if (fileType === 'file') {
          return `https://docs.google.com/viewer?url=${encodeURIComponent(res.data.secure_url)}&embedded=true`;
        }
    
        return res.data.secure_url;
      } catch (error) {
        console.error("Detailed Cloudinary upload error:", error);
        alert("File upload failed. Please try again.");
        return null;
      }
    };
    

    const handleImageUpload = async (e, fileType = 'image') => {
      const file = e.target.files[0];
      if (!file) {
        console.error('No file selected');
        return;
      }
    
      // Validation for file type and size (as before)
      const validationOptions = {
        image: {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
          maxSizeLabel: '10 MB',
        },
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
        alert(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        e.target.value = null; // Reset file input
        return;
      }
    
      try {
        const resizedFile = await resizeImage(file);
        const fileUrl = await handleFileUploadToCloudinary(resizedFile, fileType, setProgress);
    
        if (fileUrl) {
          setThumbnail(fileUrl);
          setThumbnailPreview(fileUrl);
        }
        e.target.value = null;
      } catch (error) {
        console.log(error);
        toast.error('Error uploading thumbnail');
      }
    };
    
    
    // Remove thumbnail
    const removeThumbnail = () => {
      setThumbnail(null);
      setThumbnailPreview(null);
      setProgress(0)
    };

    // Prepare form data for parent component
    const formData = {
        description,
        thumbnail, 
        price,
        courseContent
    };

    // Send data to parent component whenever it changes
    useEffect(() => {
        sendData(formData);
    }, [thumbnail, description, price,courseContent]);

    return (
      <>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Course Thumbnail</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3 max-w-md aspect-video">
            {thumbnailPreview ? (
              <div className="relative w-full max-w-md  aspect-video overflow-hidden rounded-lg">
                <img
                  src={thumbnailPreview}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs z-10"
                >
                  <X/>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 aspect-video rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="thumbnailUpload"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="thumbnailUpload"
                  className="mt-4 inline-block px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  Upload Image
                </label>
                
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Course Description</h3>
          <textarea
            placeholder="Enter your course description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="text-right text-sm text-gray-500">
            {description.length}/500
          </div>
          {errors?.advanceInfo?.description && <span className="text-red-500 text-sm">{errors?.advanceInfo?.description}</span>}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Course Content</h3>
          <textarea
            placeholder="Describe what you will teach in this course"
            value={courseContent}
            onChange={(e) => setCourseContent(e.target.value)}
            className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors?.advanceInfo?.courseContent && <span className="text-red-500 text-sm">{errors?.advanceInfo?.courseContent}</span>}
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Course Price</h3>
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">₹</span>
            <input
              type="text"
              placeholder="Enter course price"
              value={formattedPrice}
              onChange={handlePriceChange}
              min="0"
              step="1"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {price && (
            <div className="mt-2 ms-4 text-sm text-gray-500">
              Price in words: {convertNumberToWords(parseFloat(price))}
            </div>
          )}
        </div>
      </div>
</>
    )
}

export default AdvancedInfo