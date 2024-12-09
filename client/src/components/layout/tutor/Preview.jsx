"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCourse } from "../../../store/slices/courseSlice";
import { selectLessons } from "../../../store/slices/lessonsSlice";

export default function CoursePreview() {
  const [activeLesson, setActiveLesson] = useState(null);

  const course = useSelector(selectCourse);
  console.log("course in state",course);
  

  // Helper function to format duration
  const formatDuration = (duration, unit) => {
    if (unit === "hours") return `${duration} hour${duration > 1 ? "s" : ""}`;
    if (unit === "minutes")
      return `${duration} minute${duration > 1 ? "s" : ""}`;
    return `${duration} ${unit}`;
  };

  const formatCurrency = (num) => {
    const cleanedNum = num?.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto my-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-4">{course?.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {course?.category}
              </span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {course?.difficulty}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {formatDuration(
                  course?.duration,
                  course?.durationUnit || "minutes"
                )}
              </span>
            </div>
            <p className="text-gray-700 mb-6">{course?.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">Language</h3>
                <p>{course?.language}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Topic</h3>
                <p>{course?.topic}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Lessons</h3>
                <p>{course.lessons.length}</p>
              </div>
            </div>
          </div>

          <div className="md:w-1/3">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="aspect-video w-full">
                <img
                  src={course?.thumbnail}
                  alt="Course thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                  {course?.category}
                </span>
                <h3 className="mt-2 line-clamp-2 font-medium">
                  {course?.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex text-orange-400">
                    {"★".repeat(Math.floor(course?.averageRating || 0))}
                    {"☆".repeat(5 - Math.floor(course?.averageRating || 0))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {course?.averageRating || 0}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({course?.enrolleeCount || 0} students)
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">
                    ₹{formatCurrency(course?.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          <div className="space-y-4">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson?.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  onClick={() =>
                    setActiveLesson(activeLesson === index ? null : index)
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-orange-600 font-semibold">
                        Lesson {index + 1}:
                      </span>
                      <span className="font-medium">{lesson?.lessonTitle}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDuration(lesson.duration, lesson.durationUnit)}
                    </span>
                  </div>
                </button>
                {activeLesson === index && (
                  <div className="p-4 bg-white">
                    {lesson?.video && (
                      <div className="mb-4">
                        <video
                          src={lesson?.video}
                          controls
                          className="w-full rounded"
                          poster={lesson?.lessonThumbnail}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    <p className="text-gray-700 mb-4">{lesson?.description}</p>

                    <div className="flex items-center space-x-4">
                      {lesson?.lessonNotes && (
                        <a
                          href={lesson.lessonNotes}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-6 h-6 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Lecture Notes (PDF)
                        </a>
                      )}

                     

                      {lesson?.lessonThumbnail && !lesson?.video && (
                        <img
                          src={lesson?.lessonThumbnail}
                          alt={`Thumbnail for ${lesson?.lessonTitle}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
