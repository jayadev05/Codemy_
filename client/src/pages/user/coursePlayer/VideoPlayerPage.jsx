"use client";

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
} from "lucide-react";
import Header from "../../../components/layout/Header";
import MainHeader from "../../../components/layout/user/MainHeader";
import SecondaryFooter from "../../../components/layout/user/SecondaryFooter";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";

export default function CoursePlayer() {
  const user = useSelector(selectUser);
  const [course, setCourse] = useState({});
  const [activeTab, setActiveTab] = useState("description");
  const [activeLesson, setActiveLesson] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState({});
  const [lessonProgress, setLessonProgress] = useState({});
  

  const initialCompletionStatus = useRef(new Set());
  const completedLessons = useRef(new Set());
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/course/play-course",
          { params: { userId: user._id, courseId } }
        );

        const courseData = response.data.CourseResponse;
        setCourse(courseData);

        // Initialize lesson progress from the server data
        const initialProgress = {};
        courseData.lessons?.forEach((lesson) => {
          initialProgress[lesson.id] = {
            status: lesson.status || "not-started",
            watchedPercentage: lesson.watchedPercentage || 0,
          };
          
          // Store both initial and current completion status
          if (lesson.status === "completed") {
            initialCompletionStatus.current.add(lesson.id);
            completedLessons.current.add(lesson.id);
          }
        });
        setLessonProgress(initialProgress);

        // Select first lesson (don't skip completed ones when rewatching)
        setActiveLesson(courseData.lessons?.[0]);
      } catch (error) {
        console.log("Error fetching course", error);
      }
    };

    fetchCourse();
  }, [courseId, user._id]);


  
  const handleVideoProgress = (lesson) => {
    if (!videoRef.current) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    const watchedPercentage = (currentTime / duration) * 100;

    // If lesson was initially completed, don't update its progress
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

    // Only track new completions for lessons that weren't initially completed
    if (watchedPercentage > 95 && 
        !completedLessons.current.has(lesson.id) && 
        !initialCompletionStatus.current.has(lesson.id)) {
      completedLessons.current.add(lesson.id);
      sendProgressToBackend(lesson.id);
    }
  };

  const sendProgressToBackend = async (lessonId) => {
    console.log("lessonid", lessonId);

    try {
      await axios.put("http://localhost:3000/course/update-course-progress", {
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
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-orange-500 relative">
           
          </div>
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
    // Count lessons that were either initially completed or newly completed
    const totalCompletedLessons = course.lessons?.filter(
      lesson => initialCompletionStatus.current.has(lesson.id) || 
                (lessonProgress[lesson.id]?.status === "completed" && 
                 !initialCompletionStatus.current.has(lesson.id))
    ).length || 0;

    return Math.round((totalCompletedLessons / (course?.lessons?.length || 1)) * 100);
  };

  const renderNextLessonButton = () => {
    if (!activeLesson) return null;

    const currentLessonIndex = course.lessons?.findIndex(
      (lesson) => lesson.id === activeLesson.id
    );
    const nextLesson = course.lessons?.[currentLessonIndex + 1];

    

    return (
      <button
        onClick={handleNextLesson}
        className={`
          px-4 py-2 rounded-md transition-colors flex items-center
          ${
            !nextLesson
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-700"
          }
        `}
      >
        Next Lesson
        <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    );
  };

  const renderPreviousLessonButton = () => {
    if (!activeLesson) return null;

    const currentLessonIndex = course.lessons?.findIndex(
      (lesson) => lesson.id === activeLesson.id
    );
    const prevLesson = course.lessons?.[currentLessonIndex - 1];

    

    return (
      <button
        onClick={handlePreviousLesson}
        className={`
          px-4 py-2 rounded-md transition-colors flex items-center
          ${
            !prevLesson
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-700"
          }
        `}
      >
         <ChevronLeft className="w-5 h-5 ml-2" />
        Previous Lesson
       
      </button>
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/user/profile")}
                className="text-gray-500 hover:text-gray-800"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {course.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">

            {renderPreviousLessonButton()}
            {renderNextLessonButton()}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <MoreVertical className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Course
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report Tutor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 flex gap-6">
          <div className="flex-1">
            {activeLesson && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-6">
                <video
                  ref={videoRef}
                  key={`video-${activeLesson.id}`}
                  src={activeLesson.video}
                  controls // Ensure controls are always present
                  className="w-full rounded"
                  poster={activeLesson.thumbnail}
                  onTimeUpdate={() => handleVideoProgress(activeLesson)}
                  onEnded={() => {
                    // Automatically mark as completed when video ends
                    setVideoProgress((prev) => ({
                      ...prev,
                      [activeLesson.id]: {
                        status: "completed",
                        watchedPercentage: 100,
                      },
                    }));
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                  {tabs.map(({ id, icon: Icon }) => (
                    <button
                      key={`tab-${id}`}
                      onClick={() => setActiveTab(id)}
                      className={`px-4 py-2 font-medium capitalize transition-colors rounded-md flex items-center ${
                        activeTab === id
                          ? "text-white bg-orange-500"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {id.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {activeLesson && (
                <div className="prose max-w-none">
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {activeLesson.title}
                      </h2>
                      <p className="text-gray-500">
                        {activeLesson.description}
                      </p>
                    </div>
                  )}
                  {activeTab === "attatchments" && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Lecture Notes
                      </h2>
                      <ul className="space-y-2">
                        <li>
                          <a
                            href="#"
                            className="text-orange-600 hover:underline flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            Lecture Slides (PDF)
                          </a>
                        </li>
                      </ul>
                    </div>
                  )}
                  {activeTab === "comments" && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        Comments
                      </h2>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <img
                            src="/placeholder.svg?height=40&width=40"
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              John Doe
                            </h3>
                            <p className="text-gray-600">
                              Great lecture! I learned a lot about WebFlow
                              basics.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <img
                            src="/placeholder.svg?height=40&width=40"
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Jane Smith
                            </h3>
                            <p className="text-gray-600">
                              Could you explain more about responsive design in
                              the next lecture?
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              1 day ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Lesson Notes
                </button>
              </div>
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Course Contents
                </h2>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${calculateOverallProgress()}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">
                    {calculateOverallProgress()}% Complete
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {course?.lessons?.map((lesson) => {
                 
                  const progress = lessonProgress[lesson.id] || {};
                 
                  return (
                    <div
                      key={`lesson-item-${lesson?.id}`}
                      
                      className={`
                      flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors 
                      ${
                        activeLesson?.id === lesson?.id
                          ? "bg-orange-50 border-l-4 border-orange-500"
                          : ""
                      }
                      ${progress.status === "completed" ? "opacity-80" : ""}
                    `}
                    >
                      {getLessonStatusIcon(lesson)}
                      <div className="flex-1">
                        <p
                          className={`
                          text-sm font-medium 
                          ${
                            activeLesson?.id === lesson?.id
                              ? "text-orange-600"
                              : "text-gray-900"
                          }
                          ${
                            progress.status === "completed"
                              ? " text-gray-500"
                              : ""
                          }
                        `}
                        >
                          {lesson?.title}
                        </p>
                        <p className="text-xs text-gray-500 flex justify-between">
                          <span>{`${lesson.duration} ${lesson.durationUnit}`}</span>
                          {progress.status === "in-progress" && (
                            <span className="text-orange-500">
                              {`${Math.round(
                                progress.watchedPercentage || 0
                              )}% watched`}
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
