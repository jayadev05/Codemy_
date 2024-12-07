'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectCourse } from '../../../store/slices/courseSlice'
import { selectLessons } from '../../../store/slices/lessonsSlice'

export default function CoursePreview() {

  const [activeLesson, setActiveLesson] = useState(null)

  const course=useSelector(selectCourse);
  
  const lessons=useSelector(selectLessons);

  console.log("lesson state",lessons)

  lessons.map((lesson,index)=> console.log(lesson.title,"lesson"))
  

  // Helper function to format duration
  const formatDuration = (duration, unit) => {
    if (unit === 'hours') return `${duration} hour${duration > 1 ? 's' : ''}`
    if (unit === 'minutes') return `${duration} minute${duration > 1 ? 's' : ''}`
    return `${duration} ${unit}`
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto my-8">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <div className="flex items-center mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
            {course.category}
          </span>
          <span className="text-gray-600 text-sm">
            {formatDuration(course.duration, course.durationUnit)}
          </span>
        </div>
        <p className="text-gray-700 mb-4">{course.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700">Language</h3>
            <p>{course.language}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Level</h3>
            <p>{course.difficulty}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Topic</h3>
            <p>{course.topic}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Price</h3>
            <p>₹{course.price}</p>
          </div>
        </div>
        <div className=" max-w-md aspect-video mb-6">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover rounded-lg w-full h-full"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
            
              <div key={lesson.id} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                  onClick={() => setActiveLesson(activeLesson === index ? null : index)}
                >
                
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Lesson {index + 1}: {lesson.title}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDuration(lesson.duration, lesson.durationUnit)}
                    </span>
                  </div>
                </button>
                {activeLesson === index && (
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 mb-4">{lesson.description}</p>
                    {lesson.video && (
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <video
                          src={lesson.video}
                          controls
                          className="w-full h-full object-cover rounded"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    {lesson.lessonThumbnail && (
                      <img
                        src={lesson.lessonThumbnail}
                        alt={`Thumbnail for ${lesson.lessonTitle}`}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    {lesson.lessonNotes && (
                      <div>
                        <h4 className="font-semibold mb-2">Lesson Notes</h4>
                        <p className="text-gray-700">{lesson.lessonNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

