import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ReportModal({ 
  isOpen, 
  onClose, 
  targetType, 
  targetId ,
  reportedBy
}) {

  console.log(targetType,targetId)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Issue type options based on target type
  const issueTypeOptions = {
    Course: [
      { value: 'Course Issue', label: 'Course Content Problem' },
      { value: 'Bug', label: 'Technical Issue' },
      { value: 'Feedback', label: 'Improvement Feedback' }
    ],
    Tutor: [
      { value: 'Behavior', label: 'Inappropriate Behavior' },
      { value: 'Feedback', label: 'Performance Concern' }
    ]
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !description.trim() || !issueType) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {

   
      const response = await axios.post('http://localhost:3000/admin/open-report',{
        title,
        description,
        type: issueType,
        targetType,
        targetId,
        reportedBy
      })
        

      

      if (response.status===200) {
       
        setTitle('');
        setDescription('');
        setIssueType('');
        onClose();

        toast.success("We have received your report! We will review it and get back to you soon.",{icon:'📩'});

      } 
     
    } catch (error) {
      if(error.response.status===409){
        toast.error("You already have a report in review! Please be patient.",{icon:'⏳'});
      }
      else{
        console.error('Report submission error:', error);
      toast.error('Failed to submit report. Please try again.');
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-orange-500" />
            Report {targetType}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              id="issue-type"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Select Issue Type</option>
              {issueTypeOptions[targetType].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Briefly describe the issue"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
              placeholder="Provide more details about the issue"
              required
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}