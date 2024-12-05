import React, { useState } from 'react'

function AdvancedInfo() {
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState(null);
  return (
    <>
                   <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Course Thumbnail</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
                        {thumbnail ? (
                          <img src={thumbnail} alt="Course thumbnail" className="max-w-[200px] mx-auto" />
                        ) : (
                          <div >
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Upload your course Thumbnail here. <span className="font-semibold text-orange-500">Important guidelines:</span>
                            </p>
                            <p className="text-sm text-gray-500">1200×800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png</p>
                            <button className="mt-4  px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Upload Image</button>
                          </div>
                        )}
                      </div>
                    
            
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Course Descriptions</h3>
                      <textarea
                        placeholder="Enter your course descriptions"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full min-h-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
            
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">What you will teach in this course </h3>
                        
                      </div>
                      <div className="space-y-3">
                        
                          <div className="flex items-center gap-2">
                            <textarea
                              placeholder="What you will teach in this course..."
                              
                              onChange={(e) => handleObjectiveChange(index, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <div className="w-16 text-right">
                              <span className="text-sm text-gray-500">0/120</span>
                            </div>
                          </div>
                        
                      </div>
                  
                  </div>
            
                </div>
                  </>
  )
}

export default AdvancedInfo