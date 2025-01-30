import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { selectCourse, updateCourse } from "../../store/slices/courseSlice";
import {
  Bell,
  ChevronDownIcon,
  PencilIcon,
  Search,
  TrashIcon,
} from "lucide-react";
import { selectTutor } from "../../store/slices/tutorSlice";
import defProfile from "../../assets/user-profile.png";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import LessonEditModal from "../../components/layout/tutor/LessonEditModal";
import LessonAddModal from "../../components/layout/tutor/LessonAddModal";
import axiosInstance from "@/config/axiosConfig";
import TutorHeader from "@/components/layout/tutor/TutorHeader";

function TutorEditCourse() {
  const tutor = useSelector(selectTutor);
  const courseFromRedux = useSelector(selectCourse);

  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state to manage form inputs
  const [course, setCourse] = useState({
    title: "",
    description: "",
    topic: "",
    category: "",
    language: "",
    level: "Beginner",
    price: { $numberDecimal: "0.00" },
    duration: 0,
    durationUnit: "Days",
    thumbnail: null,
    isListed: true,
    tutorId: "",
    lessons: [],
  });

  const [lessons, setLessons] = useState([]);
  const [lessonToDelete, setLessontoDelete] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

 

  // Sync Redux course state with local state

  useEffect(() => {
    if (courseFromRedux) {
      setCourse(courseFromRedux);
    }
  }, [courseFromRedux]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axiosInstance.get(
        `/course/lessons/${courseFromRedux._id}`
      );

      setLessons(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price"
          ? { $numberDecimal: value }
          : value,
    }));
  }, []);

  const resizeImage = (file, width = 1200, height = 800) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

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
            sx,
            sy,
            drawWidth,
            drawHeight, // Source rectangle
            0,
            0,
            width,
            height // Destination rectangle
          );

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
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
  };

  const handleFileUploadToCloudinary = async (file, fileType = "image") => {
    try {
      const cloudName = "diwjeqkca";
      const uploadPreset = "unsigned_upload";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Cloudinary upload error:", {
          status: res.status,
          statusText: res.statusText,
          errorDetails: errorText,
        });
        throw new Error(`Upload failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      

      // // For PDFs, always use Google Docs viewer
      // if (fileType === "file") {
      //   return `https://docs.google.com/viewer?url=${encodeURIComponent(
      //     data.secure_url
      //   )}&embedded=true`;
      // }

      return data.secure_url;
    } catch (error) {
      console.error("Detailed Cloudinary upload error:", error);
      alert("File upload failed. Please try again.");
      return null;
    }
  };

  const handleThumbnailChange = async (e, fileType = "image") => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    // Validation options for different file types
    const validationOptions = {
      image: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif"],
        maxSizeLabel: "10 MB",
      },
      // Add more file type configurations as needed
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
      alert(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
      e.target.value = null; // Reset file input
      return;
    }

    try {
      const resizedFile = await resizeImage(file);
      const fileUrl = await handleFileUploadToCloudinary(resizedFile, fileType);

      if (fileUrl) {
        setCourse((prev) => ({ ...prev, thumbnail: fileUrl }));

        setPreview(fileUrl);
      }

      e.target.value = null;
    } catch (error) {
      console.log(error);
      toast.error("Error uploading thumbnail");
    }
  };

  const triggerFileInput = () => {
    document.getElementById("thumbnailInput").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/course/course/${courseFromRedux._id}/edit`,
        { course }
      );

      dispatch(updateCourse(response.data.course));
      toast.success("Course updated successfully", {
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
      setPreview(null);
      navigate("/tutor/myCourses");
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response?.data?.message || "Error updating course", {
          style: {
            borderRadius: "10px",
            background: "#111826",
            color: "#fff",
          },
        });
      }
    }
  };

  const handleLessonDelete = (id) => {
    setDeleteModalOpen(true);
    setLessontoDelete(id);
  };

  const confirmLessonDelete = async () => {
    try {
      if (lessonToDelete) {
        const response = await axiosInstance.delete(
          `/course/lesson?lessonId=${lessonToDelete}&courseId=${courseFromRedux._id}`
        );

        setLessons((prevLessons) =>
          prevLessons.filter((lesson) => lesson._id !== lessonToDelete)
        );
        setDeleteModalOpen(false);
        toast.success("Lesson deleted successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleLessonEdit = (lesson) => {
    setSelectedLesson(lesson);
    setEditModalOpen(true);
  };

  const handleLessonUpdate = (updatedLesson) => {
    // Update the lessons array with the updated lesson
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson._id === updatedLesson._id ? updatedLesson : lesson
      )
    );
  };

  const handleAddLesson = () => {
    setAddModalOpen(true);
  };

  const fetchNewLesson = async (newLesson) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: [...(prevCourse.lessons || []), newLesson._id],
    }));

    fetchLessons();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen">
          <Sidebar activeSection={"My Courses"} />
        </div>

        {/* Main Content */}
        <main className="w-full">
          {/* Header */}
          <TutorHeader heading="Edit Course" />

          {/* View course Content */}
          <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Course Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={course.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                      value={course.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    ></textarea>
                  </div>
                  <div>
                    <label
                      htmlFor="courseContent"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Course Content
                    </label>
                    <textarea
                      name="courseContent"
                      id="courseContent"
                      rows={3}
                      value={course.courseContent}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="topic"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Topic
                      </label>
                      <input
                        type="text"
                        name="topic"
                        id="topic"
                        value={course.topic}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="level"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Language
                      </label>
                      <select
                        name="language"
                        id="language"
                        value={course.language}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Malayalam</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="level"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Level
                      </label>
                      <select
                        name="level"
                        id="level"
                        value={course.level}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Price
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          value={course.price.$numberDecimal}
                          onChange={handleInputChange}
                          className="block w-full pl-7 pr-12 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Duration
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="number"
                          name="duration"
                          id="duration"
                          value={course.duration}
                          onChange={handleInputChange}
                          className="flex-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                        <select
                          name="durationUnit"
                          value={course.durationUnit}
                          onChange={handleInputChange}
                          className="flex-shrink-0 inline-flex items-center py-2 px-4 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option>Days</option>
                          <option>Hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="thumbnail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Thumbnail{" "}
                      {preview && (
                        <span className="text-orange-600">(preview)</span>
                      )}
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="w-64 aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt="Course thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <svg
                              className="h-12 w-12 text-gray-300"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        id="thumbnailInput"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailChange}
                      />

                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isListed"
                      name="isListed"
                      type="checkbox"
                      checked={course.isListed}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isListed"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      List this course publicly
                    </label>
                  </div>

                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Lessons
                    </h3>
                    <div className="mt-2 border-t border-gray-200 pt-4">
                      {lessons.length === 0 ? (
                        <p>No lessons present </p>
                      ) : (
                        lessons.map((lesson, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                Lesson {index + 1} : {lesson.lessonTitle}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <button
                                onClick={() => handleLessonEdit(lesson)}
                                type="button"
                                className="text-orange-600 hover:text-orange-800"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleLessonDelete(lesson._id)}
                                type="button"
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      <button
                        type="button"
                        onClick={handleAddLesson}
                        className="mt-4 flex items-center text-sm font-medium text-orange-600 hover:text-orange-800"
                      >
                        <ChevronDownIcon className="h-5 w-5 mr-1" />
                        Add Lesson
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">
                Are you sure you want to delete the lesson ?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={confirmLessonDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Edit Modal */}
        <LessonEditModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          lesson={selectedLesson}
          courseId={courseFromRedux._id}
          onLessonUpdate={handleLessonUpdate}
        />

        <LessonAddModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          tutorId={tutor._id}
          courseId={courseFromRedux._id}
          onLessonAdd={fetchNewLesson}
        />
      </div>
    </>
  );
}

export default TutorEditCourse;
