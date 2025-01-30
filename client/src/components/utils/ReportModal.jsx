import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/config/axiosConfig";

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  reportedBy,
}) {
  console.log(targetType, targetId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, SetErrors] = useState({});

  // Issue type options based on target type
  const issueTypeOptions = {
    Course: [
      { value: "Course Issue", label: "Course Content Problem" },
      { value: "Bug", label: "Technical Issue" },
      { value: "Feedback", label: "Improvement Feedback" },
    ],
    Tutor: [
      { value: "Behavior", label: "Inappropriate Behavior" },
      { value: "Feedback", label: "Performance Concern" },
    ],
  };

  const validateForm = () => {
    const newErrors = {};

    if (title.length < 10) {
      newErrors.title = "Title must be at least 10 characters long";
    }

    if (description.length < 10) {
      newErrors.description =
        "Description must be at least 10-50 characters long";
    }

    SetErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form

    if (!validateForm()) return;

    if (!title.trim() || !description.trim() || !issueType) {
      toast("Please fill in all required fields", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/admin/reports", {
        title,
        description,
        type: issueType,
        targetType,
        targetId,
        reportedBy,
      });

      if (response.status === 200) {
        setTitle("");
        setDescription("");
        setIssueType("");
        onClose();

        toast.success(
          "We have received your report! We will review it and get back to you soon.",
          { icon: "📩" }
        );
      }
    } catch (error) {
      if (error.response.status === 409) {
        toast.error("You already have a report in review! Please be patient.", {
          icon: "⏳",
        });
      } else {
        console.error("Report submission error:", error);
        toast.error("Failed to submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
      <div className="flex justify-between items-center p-3 sm:p-4 border-b">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#ff6738]" />
          Report {targetType}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
  
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div>
          <label
            htmlFor="issue-type"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
          >
            Issue Type
          </label>
          <select
            id="issue-type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
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
          <label
            htmlFor="title"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
            placeholder="Briefly describe the issue"
            required
          />
          {errors.title && (
            <span className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.title}
            </span>
          )}
        </div>
  
        <div>
          <label
            htmlFor="description"
            className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] text-sm sm:text-base"
            placeholder="Provide more details about the issue"
            required
          ></textarea>
          {errors.description && (
            <span className="text-red-500 text-xs sm:text-sm mt-1">
              {errors.description}
            </span>
          )}
        </div>
  
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-[#ff6738] text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
