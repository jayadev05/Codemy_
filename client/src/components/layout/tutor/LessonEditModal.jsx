import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Upload, Clock } from "lucide-react";
import axiosInstance from "@/config/axiosConfig";

const LessonEditModal = ({
  isOpen,
  onClose,
  lesson,
  courseId,
  tutorId,
  onLessonUpdate,
}) => {
  const [lessonData, setLessonData] = useState({
    lessonTitle: "",
    description: "",
    lessonNotes: null,
    video: null,
    lessonThumbnail: null,
    duration: 0,
    durationUnit: "minutes",
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [notesPreview, setNotesPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const notesInputRef = useRef(null);

  // Populate form when lesson prop changes
  useEffect(() => {
    if (lesson) {
      setLessonData({
        lessonTitle: lesson.lessonTitle || "",
        description: lesson.description || "",
        lessonNotes: lesson.lessonNotes || null,
        video: lesson.video || null,
        lessonThumbnail: lesson.lessonThumbnail || null,
        duration: lesson.duration || 0,
        durationUnit: lesson.durationUnit || "minutes",
      });
      setVideoPreview(lesson.video);
      setThumbnailPreview(lesson.lessonThumbnail);
      setNotesPreview(lesson.lessonNotes);
    }
  }, [lesson]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //backend

  const handleFileUploadToCloudinary = async (file, fileType) => {
    try {
      const cloudName = "diwjeqkca";
      const uploadPreset = "unsigned_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Add specific handling for PDFs
      if (fileType === "file" && file.type === "application/pdf") {
        formData.append("resource_type", "auto");
        // Add a flag to indicate this is a document
        formData.append("flags", "attachment");
      }

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
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

      // For PDFs, construct a special URL that forces download/display
      if (fileType === "file" && file.type === "application/pdf") {
        // Add fl_attachment to force proper PDF handling
        const url = res.data.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        );
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          res.data.secure_url
        )}&embedded=true`;

        console.log(viewerUrl);
        console.log("PDF URL:", url);
        return url;
      }

      console.log("res.data:", res.data);

      return res.data.secure_url;
    } catch (error) {
      console.error("Detailed Cloudinary upload error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      }
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
      video: {
        maxSize: 4 * 1024 * 1024 * 1024, // 4GB
        allowedTypes: ["video/mp4", "video/mpeg", "video/quicktime"],
        maxSizeLabel: "4 GB",
      },
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        maxSizeLabel: "10 MB",
      },
      file: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf"],
        maxSizeLabel: "10 MB",
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

    // Reset input after upload
    input.value = null;

    return fileUrl;
  };

  //ui

  const handleVideoUpload = async () => {
    const videoUrl = await validateAndUploadFile(videoInputRef, "video");
    if (videoUrl) {
      setLessonData((prev) => ({
        ...prev,
        video: videoUrl,
      }));
      setVideoPreview(videoUrl);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure all required fields are present
    if (!lessonData.video) {
      toast.error("Video is required");
      return;
    }

    try {
      // Prepare the payload with required fields
      const payload = {
        ...lessonData,
        courseId,
        tutorId,
      };

      const response = await axiosInstance.put(
        `http://localhost:3000/course/lesson/${lesson._id}`,
        payload
      );

      toast.success("Lesson updated successfully");
      onLessonUpdate(response.data.lesson);
      onClose();
    } catch (error) {
      console.error("Lesson update error:", error);
      toast.error(error.response?.data?.message || "Failed to update lesson");
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

        <h2 className="text-2xl font-bold mb-6">Edit Lesson</h2>

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
              Description
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

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Lesson Duration
              </label>
              <div className="flex items-center space-x-2">
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
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
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
                    View Lesson Notes
                  </a>
                </div>
              ) : (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">
                    No lesson notes uploaded
                  </span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  ref={notesInputRef}
                  id="lessonNotesUpload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleNotesUpload}
                />
                <label
                  htmlFor="lessonNotesUpload"
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {notesPreview ? "Change" : "Upload"} PDF
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
              {videoPreview ? (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-64 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No video uploaded</span>
                </div>
              )}
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
                  <Upload className="h-4 w-4 mr-2" />
                  {videoPreview ? "Change" : "Upload"} Video
                </label>
              </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonEditModal;
