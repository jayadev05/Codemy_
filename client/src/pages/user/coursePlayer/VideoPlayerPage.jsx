import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  ChevronRight,
  FileText,
  Paperclip,
  MessageSquare,
  MoreVertical,
  Check,
  ChevronLeft,
  Trophy,
  X,
  Star,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import Header from "../../../components/layout/Header";
import MainHeader from "../../../components/layout/user/MainHeader";
import SecondaryFooter from "../../../components/layout/user/SecondaryFooter";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";
import toast from "react-hot-toast";
import ReportModal from "../../../components/utils/ReportModal";
import { selectCourse } from "@/store/slices/courseSlice";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/config/axiosConfig";
import { Label } from "@radix-ui/react-label";

export default function CoursePlayer() {
  const user = useSelector(selectUser);
  const [course, setCourse] = useState({});

  const [activeTab, setActiveTab] = useState("description");
  const [activeLesson, setActiveLesson] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState({});
  const [lessonProgress, setLessonProgress] = useState({});
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const initialCompletionStatus = useRef(new Set());
  const completedLessons = useRef(new Set());
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const courseId = useSelector(selectCourse);

  const [courseRating, setCourseRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState("Course");
  const [reportTargetId, setReportTargetId] = useState("");

  const openReportModal = (type) => {
    const targetId = type === "Tutor" ? course.tutorId : courseId;

    setReportTargetType(type);
    setReportTargetId(targetId);
    setIsMenuOpen(false);

    setIsReportModalOpen(true);
  };

  //certificate modal check

  useEffect(() => {
    // Only show modal on first completion
    if (
      calculateOverallProgress() === 100 &&
      !hasShownCompletionModal &&
      !course.certificateUrl
    ) {
      setTimeout(() => {
        setShowCertificateModal(true);
        setHasShownCompletionModal(true);
      }, 5000);
    }
  }, [lessonProgress, hasShownCompletionModal]);

  //course and ratings fetching

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get("/course/play-course", {
          params: { userId: user._id, courseId },
        });

        console.log("response", response.data);

        const courseData = response.data.CourseResponse;

        setCourse(courseData);

        const initialProgress = {};
        courseData.lessons?.forEach((lesson) => {
          initialProgress[lesson.id] = {
            status: lesson.status || "not-started",
            watchedPercentage: lesson.watchedPercentage || 0,
          };

          if (lesson.status === "completed") {
            initialCompletionStatus.current.add(lesson.id);
            completedLessons.current.add(lesson.id);
          }
        });
        setLessonProgress(initialProgress);
        setActiveLesson(courseData.lessons?.[0]);
      } catch (error) {
        console.log("Error fetching course", error);
      }
    };

    const fetchRating = async () => {
      try {
        const response = await axiosInstance.get("/course/ratings", {
          params: { userId: user._id, courseId },
        });

        setAlreadyRated(response.data?.hasRated || false);
      } catch (error) {
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        } else if (error.request) {
          console.error("No response received", error.request);
        }

        setAlreadyRated(false);
      }
    };

    fetchCourse();
    fetchRating();
  }, [courseId, user._id]);

  const handleVideoProgress = (lesson) => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    const watchedPercentage = (currentTime / duration) * 100;

    if (initialCompletionStatus.current.has(lesson.id)) {
      return;
    }

    setLessonProgress((prevProgress) => {
      const previousProgress = prevProgress[lesson.id]?.watchedPercentage || 0;

      if (watchedPercentage > previousProgress) {
        return {
          ...prevProgress,
          [lesson.id]: {
            status: watchedPercentage >= 95 ? "completed" : "in-progress",
            watchedPercentage,
          },
        };
      }
      return prevProgress;
    });

    if (
      watchedPercentage > 95 &&
      !completedLessons.current.has(lesson.id) &&
      !initialCompletionStatus.current.has(lesson.id)
    ) {
      completedLessons.current.add(lesson.id);
      sendProgressToBackend(lesson.id);
    }
  };

  const handleCertificate = async () => {
    try {
      setCertificateLoading(true);
      const response = await axiosInstance.post(
        "/course/certificate/generate",
        {
          userId: user._id,
          courseId: courseId,
          courseName: course.title,
        }
      );

      if (response.status === 200) {
        toast.success("Certificate generated successfully");
        setCertificateUrl(response.data.certificateUrl);
      }
    } catch (error) {
      console.error("Error generating certificate", error);
      toast.error("Failed to generate certificate");
    } finally {
      setCertificateLoading(false);
    }
  };

  const sendProgressToBackend = async (lessonId) => {
    try {
      await axiosInstance.put("/course/course-progress", {
        userId: user._id,
        courseId,
        lessonId,
      });
    } catch (error) {
      console.error("Error updating lesson progress", error);
    }
  };

  const handleNextLesson = () => {
    const currentLessonIndex = course.lessons.findIndex(
      (lesson) => lesson.id === activeLesson.id
    );

    if (currentLessonIndex === -1) return;

    const nextLesson = course.lessons[currentLessonIndex + 1];

    if (nextLesson) {
      setActiveLesson(nextLesson);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const handlePreviousLesson = () => {
    const currentLessonIndex = course.lessons.findIndex(
      (lesson) => lesson.id === activeLesson.id
    );

    if (currentLessonIndex === -1) return;

    const prevLesson = course.lessons[currentLessonIndex - 1];

    if (prevLesson) {
      setActiveLesson(prevLesson);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  const getLessonStatusIcon = (lesson) => {
    const progress = lessonProgress[lesson.id] || {};

    switch (progress.status) {
      case "completed":
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        );
      case "in-progress":
        return lesson.id === activeLesson?.id ? (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-orange-500 relative" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-orange-500" />
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
    }
  };

  const calculateOverallProgress = () => {
    const totalCompletedLessons =
      course.lessons?.filter(
        (lesson) =>
          initialCompletionStatus.current.has(lesson.id) ||
          (lessonProgress[lesson.id]?.status === "completed" &&
            !initialCompletionStatus.current.has(lesson.id))
      ).length || 0;

    return Math.round(
      (totalCompletedLessons / (course?.lessons?.length || 1)) * 100
    );
  };

  const handleReview = () => {
    setRatingModalOpen(true);
  };

  const submitCourseReview = async () => {
    try {
      const response = await axiosInstance.post("/course/ratings", {
        courseId: courseId,
        userId: user._id,
        rating: courseRating,
        feedback,
      });

      if (response.status === 200) {
        setRatingModalOpen(false);
        setAlreadyRated(true);
        toast.success("Thanks for rating the course!");
      }
    } catch (error) {
      console.error("Error rating course", error);

      if (error.response?.status === 400) {
        toast.error("You have already rated this course.", { icon: "🌟" });
      } else {
        toast.error("Failed to rate the course. Please try again.");
      }
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1 mt-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`
              w-10 h-10 cursor-pointer transition-colors duration-200
              ${
                (hoveredRating || courseRating) >= star
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }
            `}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setCourseRating(star)}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "description", icon: FileText },
    { id: "attatchments", icon: Paperclip },
    { id: "comments", icon: MessageSquare },
  ];

  return (
    <>
      <Header />
      <MainHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full mx-auto transform transition-all">
              <div className="relative">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="absolute -right-2 -top-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <div className="mb-4 inline-flex p-3 bg-yellow-100 rounded-full">
                    <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    You've completed the course! Your certificate is ready to be
                    generated.
                  </p>
                  <button
                    onClick={() => {
                      if (!certificateUrl) handleCertificate();
                    }}
                    disabled={certificateLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {certificateLoading ? (
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    ) : (
                      <Download className="w-5 h-5 mr-2" />
                    )}
                    {certificateLoading
                      ? "Generating..."
                      : "Download Certificate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all">
              
              <div className="relative">
                
                <button
                  onClick={() => setRatingModalOpen(false)}
                  className="absolute -right-2 -top-2 text-gray-500 hover:text-gray-700"
                >
                  
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center">
                  
                  <div className="mb-3 inline-flex p-3 bg-yellow-100 rounded-full">
                    
                    <ThumbsUp className="w-12 h-12 text-yellow-500" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    
                    You've completed the course! Please give the course a
                    rating.
                  </p>
                  <div className="flex justify-center items-center mb-6">
                    
                    {renderStarRating()}
                  </div>
                  <div className="space-y-4 mb-6">
                    
                    <div className="space-y-2">
                      
                      <Label htmlFor="feedback" className="text-left block">
                        
                        Share your feedback
                      </Label>
                      <Textarea
                        id="feedback"
                        placeholder="Tell us what you think... Your feedback helps us improve."
                        className="min-h-[120px] resize-none"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={250}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      
                      {feedback.length}/250 characters
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      submitCourseReview(feedback);
                      setFeedback("");
                    }}
                    disabled={!courseRating}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    
                    Submit Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/user/profile")}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-xl">
                {course?.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={handleReview}
                className="bg-orange-100 text-orange-500 px-3 sm:px-4 py-1.5 sm:py-2 text-sm whitespace-nowrap rounded-lg"
              >
                Write A Review
              </button>

              <button
                onClick={handlePreviousLesson}
                className={`
                  px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                  ${
                    !course?.lessons?.[
                      course?.lessons.findIndex(
                        (lesson) => lesson.id === activeLesson?.id
                      ) - 1
                    ]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }
                `}
                disabled={
                  !course?.lessons?.[
                    course?.lessons.findIndex(
                      (lesson) => lesson.id === activeLesson?.id
                    ) - 1
                  ]
                }
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={handleNextLesson}
                className={`
                  px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                  ${
                    !course?.lessons?.[
                      course?.lessons.findIndex(
                        (lesson) => lesson.id === activeLesson?.id
                      ) + 1
                    ]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }
                `}
                disabled={
                  !course?.lessons?.[
                    course?.lessons.findIndex(
                      (lesson) => lesson.id === activeLesson?.id
                    ) + 1
                  ]
                }
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* report option  */}

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={() => openReportModal("Course")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 w-full transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                      Report Course
                    </button>
                    <button
                      onClick={() => openReportModal("Tutor")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 w-full transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                      Report Tutor
                    </button>
                  </div>
                )}
                <ReportModal
                  isOpen={isReportModalOpen}
                  onClose={() => setIsReportModalOpen(false)}
                  targetType={reportTargetType}
                  targetId={reportTargetId}
                  reportedBy={user._id}
                />
              </div>
            </div>

            </div>

          </div>
        </header>

        <div className="container mx-auto px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Video and Lesson Details Section */}
          <div className="w-full lg:flex-2 lg:max-w-4xl">
            {activeLesson && (
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
                {activeLesson ? (
                  <video
                    ref={videoRef}
                    key={`video-${activeLesson.id}`}
                    src={activeLesson.video}
                    controls
                    className="absolute inset-0 w-full h-full object-contain"
                    poster={activeLesson.thumbnail}
                    onTimeUpdate={() => handleVideoProgress(activeLesson)}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    Select a lesson to begin
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-start mb-4 sm:mb-6 overflow-x-auto">
                <div className="flex gap-2">
                  {tabs.map(({ id, icon: Icon }) => (
                    <button
                      key={`tab-${id}`}
                      onClick={() => setActiveTab(id)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 font-medium capitalize transition-all duration-200 rounded-lg flex items-center whitespace-nowrap text-sm sm:text-base ${
                        activeTab === id
                          ? "text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      {id.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {activeLesson && (
                <div className="prose max-w-none">
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {activeLesson.title}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {activeLesson.description}
                      </p>
                    </div>
                  )}
                  {activeTab === "attatchments" && (
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Lecture Notes
                      </h2>
                      <div className="space-y-2">
                        <a
                          href={activeLesson.notes}
                          className="flex items-center p-3 border rounded-lg hover:bg-orange-50 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-3" />
                          Notes(pdf)
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Course Contents Sidebar */}
          <div className="w-full lg:flex-1">
            <div className="bg-white rounded-xl shadow-sm lg:sticky lg:top-24">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Course Contents
                </h2>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${calculateOverallProgress()}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    {calculateOverallProgress()}%
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[50vh] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
                {course?.lessons?.map((lesson) => {
                  const progress = lessonProgress[lesson.id] || {};
                  const isActive = activeLesson?.id === lesson?.id;

                  return (
                    <div
                      key={`lesson-item-${lesson?.id}`}
                      onClick={() => setActiveLesson(lesson)}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-orange-50 cursor-pointer transition-all duration-200
                      ${
                        isActive
                          ? "bg-orange-50 border-l-4 !border-orange-500"
                          : ""
                      }
                      ${progress.status === "completed" ? "opacity-90" : ""}
                    `}
                      style={
                        isActive ? { borderLeft: "4px solid #f97316" } : {}
                      }
                    >
                      {getLessonStatusIcon(lesson)}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-medium truncate
                          ${isActive ? "text-orange-600" : "text-gray-900"}
                          ${
                            progress.status === "completed"
                              ? "text-gray-600"
                              : ""
                          }
                        `}
                        >
                          {lesson?.title}
                        </p>
                        <p className="text-xs text-gray-500 flex justify-between mt-0.5 sm:mt-1">
                          <span>
                            {lesson.duration} {lesson.durationUnit}
                          </span>
                          {progress.status === "in-progress" && (
                            <span className="text-orange-500 font-medium">
                              {Math.round(progress.watchedPercentage || 0)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SecondaryFooter />
    </>
  );
}
