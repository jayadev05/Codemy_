import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectTutor } from "../../../../store/slices/tutorSlice";
import { selectCourse } from "../../../../store/slices/courseSlice";
import axios from "axios";

const Curriculum = ({ initialData, sendData }) => {
  const tutor = useSelector(selectTutor);
  const course = useSelector(selectCourse);

  const [lessons, setLessons] = useState(
    initialData?.length > 0
      ? initialData
      : [
          {
            id: 1,
            lessonTitle: "Lesson Title",
            isExpanded: false,
            description: "",
            video: "",
            lessonNotes: "",
            selectedThumbnail: "",
            lessonThumbnail: "",
            duration: 0,
            durationUnit: "minute",
            tutorId: tutor._id,
          },
        ]
  );

  // State for active modal to manage which lesson is being edited
  const [activeModal, setActiveModal] = useState({
    type: null,
    lessonId: null,
  });

  const [progress, setProgress] = useState(0);
  console.log(progress);

  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    // Only send data if there are meaningful changes
    if (
      lessons.some(
        (lesson) =>
          lesson.lessonTitle &&
          lesson.lessonTitle.trim() !== "Lesson Name" &&
          (lesson.description ||
            lesson.video ||
            lesson.lessonNotes ||
            lesson.duration > 0)
      )
    ) {
      sendData(lessons);
    }
  }, [lessons, sendData]);

  // Utility function to update a specific lesson
  const updateLesson = (lessonId, updates) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      )
    );
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

            // Add progress state setter if needed
            setProgress(percentCompleted);
          },
        }
      );

      // For PDFs, always use Google Docs viewer
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

  // Unified file upload handler
  const handleFileUpload = async (inputRef, fileType, lessonId) => {
    console.log("input ref", inputRef);
    console.log("input ref current", inputRef.current);

    const input = inputRef.current;

    if (!input || !input.files) {
      console.error("File input reference is not available.");
      return;
    }

    const file = input.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    // Validation options for different file types
    const validationOptions = {
      video: {
        maxSize: 4 * 1024 * 1024 * 1024, // 4GB
        allowedTypes: ["video/mp4", "video/mpeg", "video/quicktime"],
        maxSizeLabel: "4 GB",
      },
      file: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["application/pdf"],
        maxSizeLabel: "10 MB",
      },
      image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        maxSizeLabel: "5 MB",
      },
    };

    const options = validationOptions[fileType] || {};
    const { maxSize, allowedTypes, maxSizeLabel } = options;

    // File size check
    if (file.size > maxSize) {
      alert(`File size should be less than ${maxSizeLabel}`);
      input.value = null; // Reset file input
      return;
    }

    // File type check
    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
      input.value = null; // Reset file input
      return;
    }

    // Handle different file types
    switch (fileType) {
      case "video":
      case "image":
        const fileUrl = await handleFileUploadToCloudinary(file, fileType);
        if (fileUrl) {
          updateLesson(lessonId, {
            [fileType === "video" ? "video" : "lessonThumbnail"]: fileUrl,
            isExpanded: true,
            activeModal: {
              type: fileType,
              lessonId: lessonId,
            },
          });
        }
        break;
      case "file":
        const docUrl = await handleFileUploadToCloudinary(file, fileType);
        updateLesson(lessonId, {
          lessonNotes: docUrl,
          isExpanded: true,
          activeModal: {
            type: fileType,
            lessonId: lessonId,
          },
        });
        break;
      default:
        console.error("Unsupported file type");
        break;
    }

    // Clear file input after successful upload

    input.value = null;
  };

  // Add new lesson
  const addLesson = () => {
    setLessons((prevLessons) => [
      ...prevLessons,
      {
        id: Math.max(...prevLessons.map((l) => l.id), 0) + 1,
        lessonTitle: "Lesson Title",
        isExpanded: false,
        description: "",
        video: "",
        lessonNotes: "",
        selectedThumbnail: "",
        lessonThumbnail: "",
        duration: 0,
        durationUnit: "minute",
        tutorId: tutor._id,
      },
    ]);
  };

  // Delete a lesson
  const deleteLesson = (id) => {
    setLessons((prevLessons) =>
      prevLessons.filter((lesson) => lesson.id !== id)
    );
  };

  // Toggle lesson expansion
  const toggleLesson = useCallback((lessonId) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, isExpanded: !lesson.isExpanded }
          : lesson
      )
    );
  }, []);

  // Handle text save for title and description
  const handleTextSave = (lessonId, type, value) => {
    updateLesson(lessonId, {
      [type]: value,
      isExpanded: type === "description" && value ? true : undefined,
      activeModal: { type: null, lessonId: null },
    });
  };

  // Remove specific content from a lesson
  const handleRemoveContent = (lessonId, contentType) => {
    const resetMap = {
      video: { video: null },
      image: { selectedThumbnail: null, lessonThumbnail: null },
      file: { lessonNotes: null },
      description: { description: null },
      duration:{duration:null}
    };

    updateLesson(lessonId, resetMap[contentType] || {});
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleLesson(lesson.id)}
                  className="flex items-center gap-4 flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${
                      lesson.isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Lesson {String(lesson.id).padStart(2, "0")}:{" "}
                    {lesson.lessonTitle}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-200 rounded"
                      onClick={() =>
                        setActiveModal({
                          type: "options",
                          lessonId: lesson.id,
                        })
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      setActiveModal({ type: "edit", lessonId: lesson.id });
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteLesson(lesson.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {lesson.isExpanded && (
                <div className="mt-4 space-y-2">
                  {/* Thumbnail */}
                  {lesson.lessonThumbnail && (
                    <div className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-pink-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Thumbnail</span>
                      </div>
                      <button
                        onClick={() => handleRemoveContent(lesson.id, "image")}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Video */}
                  {lesson.video && (
                    <div className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Video</span>
                      </div>
                      <button
                        onClick={() => handleRemoveContent(lesson.id, "video")}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Lecture Notes */}
                  {lesson.lessonNotes && (
                    <div className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Lecture Notes
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveContent(lesson.id, "file")}
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  {lesson.description && (
                    <div className="bg-white p-3 rounded-md shadow-sm flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-purple-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Description</span>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveContent(lesson.id, "description")
                        }
                        className="text-red-500 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addLesson}
            className="w-full mt-4 px-4 py-2 border border-gray-300 text-orange-500 rounded-md hover:bg-gray-50"
          >
            Add Lesson
          </button>
        </div>
      </div>

      {activeModal.type === "edit" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Edit Lesson Name</h2>
            <input
              type="text"
              value={
                activeModal.lessonId
                  ? lessons.find((l) => l.id === activeModal.lessonId)
                      ?.lessonTitle || ""
                  : ""
              }
              onChange={(e) =>
                handleTextSave(
                  activeModal.lessonId,
                  "lessonTitle",
                  e.target.value
                )
              }
              placeholder="Write your lesson name here..."
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, lessonId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, lessonId: null })}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "options" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add Content</h2>
            <div className="space-y-2">
             
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "video",
                      lessonId: activeModal.lessonId,
                    })
                  }
                  className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                    lessons.find((l) => l.id === activeModal.lessonId)?.video
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !!lessons.find((l) => l.id === activeModal.lessonId)?.video
                  }
                >
                  Add Video
                </button>
                {lessons.find((l) => l.id === activeModal.lessonId)?.video && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveContent(activeModal.lessonId, "video")
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "duration",
                      lessonId: activeModal.lessonId,
                    })
                  }
                  className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                    lessons.find((l) => l.id === activeModal.lessonId)?.duration
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !!lessons.find((l) => l.id === activeModal.lessonId)
                      ?.duration
                  }
                >
                  Add Lesson Duration
                </button>
                
                {lessons.find((l) => l.id === activeModal.lessonId)
                  ?.duration && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveContent(activeModal.lessonId, "duration")
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "image",
                      lessonId: activeModal.lessonId,
                    })
                  }
                  className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                    lessons.find((l) => l.id === activeModal.lessonId)
                      ?.lessonThumbnail
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !!lessons.find((l) => l.id === activeModal.lessonId)
                      ?.lessonThumbnail
                  }
                >
                  Add Video Thumbnail
                </button>
                {lessons.find((l) => l.id === activeModal.lessonId)
                  ?.lessonThumbnail && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveContent(activeModal.lessonId, "image")
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "file",
                      lessonId: activeModal.lessonId,
                    })
                  }
                  className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                    lessons.find((l) => l.id === activeModal.lessonId)
                      ?.lessonNotes
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !!lessons.find((l) => l.id === activeModal.lessonId)
                      ?.lessonNotes
                  }
                >
                  Attach Lecture Notes (PDF)
                </button>
                {lessons.find((l) => l.id === activeModal.lessonId)
                  ?.lessonNotes && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveContent(activeModal.lessonId, "file")
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "description",
                      lessonId: activeModal.lessonId,
                    })
                  }
                  className={`w-full p-2 text-left hover:bg-gray-100 rounded ${
                    lessons.find((l) => l.id === activeModal.lessonId)
                      ?.description
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    !!lessons.find((l) => l.id === activeModal.lessonId)
                      ?.description
                  }
                >
                  Add Description
                </button>
                {lessons.find((l) => l.id === activeModal.lessonId)
                  ?.description && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveContent(activeModal.lessonId, "description")
                    }
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, lessonId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "video" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Lecture Video</h2>
            <div className="relative w-full mb-4">
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setActiveModal((prev) => ({
                    ...prev,
                    selectedFile: file,
                  }));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center border border-gray-300 rounded p-2">
                <span className="flex-grow text-sm text-gray-500">
                  {activeModal.selectedFile?.name || "Select video"}
                </span>
                <span className="ml-2 px-3 py-1 bg-gray-100 rounded">
                  Browse
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Note: All files must be at least 720p and less than 2.0 GB.
            </p>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-orange-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProgress(0);
                  setActiveModal({ type: null, lessonId: null });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>

              {progress === 100 ? (
                <button
                  onClick={() => {
                    setProgress(0);
                    setActiveModal({ type: null, lessonId: null });
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeModal.selectedFile) {
                      handleFileUpload(
                        { current: { files: [activeModal.selectedFile] } },
                        "video",
                        activeModal.lessonId
                      );
                    }
                  }}
                  disabled={!activeModal.selectedFile || progress > 0}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {progress > 0 ? `Uploading ${progress}%` : "Upload Video"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "file" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">
              Attach Lecture Note (pdf)
            </h2>
            <div className="relative w-full mb-4">
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setActiveModal((prev) => ({
                    ...prev,
                    selectedFile: file,
                  }));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center border border-gray-300 rounded p-2">
                <span className="flex-grow text-sm text-gray-500">
                  {activeModal.selectedFile?.name || "Select file"}
                </span>
                <span className="ml-2 px-3 py-1 bg-gray-100 rounded">
                  Browse
                </span>
              </div>
            </div>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-orange-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setProgress(0);
                  setActiveModal({ type: null, lessonId: null });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>

              {progress === 100 ? (
                <button
                  onClick={() => {
                    setProgress(0);
                    setActiveModal({ type: null, lessonId: null });
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeModal.selectedFile) {
                      handleFileUpload(
                        { current: { files: [activeModal.selectedFile] } },
                        "file",
                        activeModal.lessonId
                      );
                    }
                  }}
                  disabled={!activeModal.selectedFile || progress > 0}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {progress > 0 ? `Uploading ${progress}%` : "Upload File"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "image" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Attach Video Thumbnail</h2>
            <div className="relative w-full mb-4">
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setActiveModal((prev) => ({
                        ...prev,
                        selectedFile: file,
                        selectedThumbnail: reader.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept="image/*"
              />
              <div className="flex items-center border border-gray-300 rounded p-2">
                <span className="flex-grow text-sm text-gray-500">
                  {activeModal.selectedFile?.name || "Select image"}
                </span>
                <span className="ml-2 px-3 py-1 bg-gray-100 rounded">
                  Browse
                </span>
              </div>
            </div>
            {activeModal.selectedThumbnail && (
              <div className="mb-4">
                <img
                  src={activeModal.selectedThumbnail}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-orange-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, lessonId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>

              {progress === 100 ? (
                <button
                  onClick={() => {
                    setProgress(0);
                    setActiveModal({ type: null, lessonId: null });
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeModal.selectedFile) {
                      handleFileUpload(
                        { current: { files: [activeModal.selectedFile] } },
                        "image",
                        activeModal.lessonId
                      );
                    }
                  }}
                  disabled={!activeModal.selectedFile || progress > 0}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {progress > 0 ? `Uploading ${progress}%` : "Upload Thumbnail"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "description" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add Description</h2>
            <textarea
              value={activeModal.description}
              onChange={(e) =>
                handleTextSave(
                  activeModal.lessonId,
                  "description",
                  e.target.value
                )
              }
              placeholder={`Write your description here...`}
              className={`w-full p-2 border border-gray-300 rounded mb-4 h-32`}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, sectionId: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setActiveModal({ type: null, lessonId: null })}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Save Description
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal.type === "duration" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add Lesson Duration</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="duration" className="block mb-2">
                  Duration
                </label>
                <input
                  type="number"
                  id="duration"
                  value={
                    lessons.find((l) => l.id === activeModal.lessonId)
                      ?.duration || ""
                  }
                  onChange={(e) => {
                    const updatedLessons = lessons.map((lesson) =>
                      lesson.id === activeModal.lessonId
                        ? { ...lesson, duration: Number(e.target.value) }
                        : lesson
                    );
                    setLessons(updatedLessons);
                  }}
                  min="0"
                  className="w-full p-2 border rounded"
                  placeholder="Enter duration"
                />
              </div>

              <div>
                <label htmlFor="durationUnit" className="block mb-2">
                  Duration Unit
                </label>
                <select
                  id="durationUnit"
                  value={
                    lessons.find((l) => l.id === activeModal.lessonId)
                      ?.durationUnit || "minute"
                  }
                  onChange={(e) => {
                    const updatedLessons = lessons.map((lesson) =>
                      lesson.id === activeModal.lessonId
                        ? { ...lesson, durationUnit: e.target.value }
                        : lesson
                    );
                    setLessons(updatedLessons);
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="minute">Minutes</option>
                  <option value="hour">Hours</option>
                
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveModal({ type: null, lessonId: null })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal({ type: null, lessonId: null })}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Curriculum;
