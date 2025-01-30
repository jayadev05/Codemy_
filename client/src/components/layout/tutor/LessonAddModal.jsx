import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Upload, BookOpen, Video } from "lucide-react";
import axiosInstance from "@/config/axiosConfig";

const LessonAddModal = ({
  isOpen,
  onClose,
  tutorId,
  courseId,
  onLessonAdd,
}) => {
  const [lessonData, setLessonData] = useState({
    lessonTitle: "",
    description: "",
    video: "",
    lessonNotes: null,
    lessonThumbnail: null,
    duration: 0,
    durationUnit: "minute",
    tutorId: tutorId,
    courseId: courseId,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [notesPreview, setNotesPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const thumbnailInputRef = useRef(null);
  const notesInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUploadToCloudinary = async (file, fileType) => {
    try {
      const cloudName = "diwjeqkca";
      const uploadPreset = "unsigned_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      // For PDFs, use Google Docs viewer
      if (fileType === "file") {
        return `https://docs.google.com/viewer?url=${encodeURIComponent(
          res.data.secure_url
        )}&embedded=true`;
      }

      return res.data.secure_url;
    } catch (error) {
      console.error("Detailed Cloudinary upload error:", error);
      toast.error("File upload failed. Please try again.");
      setProgress(0);
      return null;
    }
  };

  const validateAndUploadFile = async (inputRef, fileType) => {
    const input = inputRef.current;

    if (!input || !input.files) {
      console.error("File input reference is not available.");
      return null;
    }

    const file = input.files[0];
    if (!file) {
      console.error("No file selected");
      return null;
    }

    // Validation options for different file types
    const validationOptions = {
      image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        maxSizeLabel: "5 MB",
      },
      file: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf"],
        maxSizeLabel: "10 MB",
      },
      video: {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ["video/mp4", "video/mpeg", "video/quicktime"],
        maxSizeLabel: "100 MB",
      },
    };

    const options = validationOptions[fileType];
    const { maxSize, allowedTypes, maxSizeLabel } = options;

    // File size check
    if (file.size > maxSize) {
      toast.error(`File size should be less than ${maxSizeLabel}`);
      input.value = null; // Reset file input
      return null;
    }

    // File type check
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
      input.value = null; // Reset file input
      return null;
    }

    // Upload file
    const fileUrl = await handleFileUploadToCloudinary(file, fileType);

    input.value = null;

    return fileUrl;
  };

  const handleThumbnailUpload = async () => {
    const thumbnailUrl = await validateAndUploadFile(
      thumbnailInputRef,
      "image"
    );
    if (thumbnailUrl) {
      setLessonData((prev) => ({
        ...prev,
        lessonThumbnail: thumbnailUrl,
      }));
      setThumbnailPreview(thumbnailUrl);
    }
  };

  const handleNotesUpload = async () => {
    const notesUrl = await validateAndUploadFile(notesInputRef, "file");
    if (notesUrl) {
      setLessonData((prev) => ({
        ...prev,
        lessonNotes: notesUrl,
      }));
      setNotesPreview(notesUrl);
    }
  };

  const handleVideoUpload = async () => {
    const videoUrl = await validateAndUploadFile(videoInputRef, "video");
    if (videoUrl) {
      setLessonData((prev) => ({
        ...prev,
        video: videoUrl,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!lessonData.lessonThumbnail) {
      toast.error("Lesson Thumbnail is required");
      return;
    }
    if (!lessonData.video) {
      toast.error("Lesson Video is required");
      return;
    }
    if (!lessonData.description) {
      toast.error("Lesson Description is required");
      return;
    }

    try {
      const payload = { ...lessonData };
  

      const response = await axiosInstance.post("/course/lessons", payload);

      toast.success("Lesson added successfully");
      onLessonAdd(response.data.lesson);
      onClose();

      // Reset form
      setLessonData({
        lessonTitle: "",
        description: "",
        video: "",
        lessonNotes: null,
        lessonThumbnail: null,
        duration: 0,
        durationUnit: "minute",
        tutorId: tutorId,
      });
      setThumbnailPreview(null);
      setNotesPreview(null);
    } catch (error) {
      console.error("Lesson creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create lesson");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create New Lesson</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="lessonTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson Title
            </label>
            <input
              type="text"
              name="lessonTitle"
              id="lessonTitle"
              value={lessonData.lessonTitle}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={lessonData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Lesson Duration
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  value={lessonData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <select
                  name="durationUnit"
                  value={lessonData.durationUnit}
                  onChange={handleInputChange}
                  className="mt-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="minute">Minutes</option>
                  <option value="hour">Hours</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="lessonNotes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lesson Notes (PDF)
            </label>
            <div className="flex items-center space-x-4">
              {notesPreview ? (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <a
                    href={notesPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Notes
                  </a>
                </div>
              ) : (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No notes uploaded</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  ref={notesInputRef}
                  id="notesUpload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleNotesUpload}
                />
                <label
                  htmlFor="notesUpload"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {notesPreview ? "Change" : "Upload"} Notes
                </label>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="video"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lesson Video
            </label>
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="file"
                  ref={videoInputRef}
                  id="videoUpload"
                  accept="video/mp4,video/mpeg,video/quicktime"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <label
                  htmlFor="videoUpload"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Video className="h-4 w-4 mr-2" />
                  {lessonData.video ? "Change" : "Upload"} Video
                </label>
              </div>
              {progress > 0 && progress < 100 && (
                <>
                  <p>Uploading {progress}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
              {lessonData.video && (
                <div className="text-sm text-green-600">
                  Video uploaded successfully
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="lessonThumbnail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lesson Thumbnail
            </label>
            <div className="flex items-center space-x-4">
              {thumbnailPreview ? (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Lesson Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No thumbnail uploaded</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  id="thumbnailUpload"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
                <label
                  htmlFor="thumbnailUpload"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {thumbnailPreview ? "Change" : "Upload"} Thumbnail
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Create Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonAddModal;
