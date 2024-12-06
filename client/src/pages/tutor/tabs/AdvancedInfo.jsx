import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { X } from 'lucide-react';
import useCurrencyFormat from '../../../hooks/UseCurrencyFormat';

function AdvancedInfo({sendData}) {
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const { 
      value: price, 
      displayValue: formattedPrice, 
      handleChange: handlePriceChange 
  } = useCurrencyFormat();

    

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
    
    // Updated handleImageUpload function
    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      
      // Validate file
      if (!file) return;
      
      // Check file size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      try {
        // Resize the image to 1200x800
        const resizedBlob = await resizeImage(file, 1200, 800);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnail(reader.result);
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(resizedBlob);
      } catch (error) {
        console.error('Image processing error:', error);
        toast.error('Failed to process image');
      }
    };

    // Remove thumbnail
    const removeThumbnail = () => {
      setThumbnail(null);
      setThumbnailPreview(null);
    };

    // Prepare form data for parent component
    const formData = {
        description,
        thumbnail, //base64 string
        price
    };

    // Send data to parent component whenever it changes
    useEffect(() => {
        sendData(formData);
    }, [thumbnail, description, price]);

    return (
      <>
    <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Course Thumbnail</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-3 max-w-md aspect-video ">
            {thumbnailPreview ? (
                <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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

    <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Course Descriptions</h3>
        <textarea
            placeholder="Enter your course descriptions"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="text-right text-sm text-gray-500">
            {description.length}/500
        </div>
    </div>

    <div className="mb-6">
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
</>
    )
}

export default AdvancedInfo