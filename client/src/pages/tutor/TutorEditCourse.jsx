import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { selectCourse, updateCourse } from "../../store/slices/courseSlice";
import { Bell, ChevronDownIcon, PencilIcon, Search, TrashIcon } from "lucide-react";
import { selectTutor } from "../../store/tutorSlice";
import defProfile from "../../assets/user-profile.png";
import axios from "axios";
import toast from "react-hot-toast";

function TutorEditCourse() {

  const tutor = useSelector(selectTutor);
  const courseFromRedux = useSelector(selectCourse);

  const dispatch=useDispatch()
  
  // Local state to manage form inputs
  const [course, setCourse] = useState({
    title: '',
    description: '',
    topic: '',
    category:'',
    language: '',
    level: 'Beginner',
    price: { $numberDecimal: '0.00' },
    duration: 0,
    durationUnit: 'Days',
    thumbnail: null,
    isListed: true,
    tutorId:'',
    lessons: []
  });

  // Sync Redux course state with local state on component mount
  useEffect(() => {
    if (courseFromRedux) {
      setCourse(courseFromRedux);
    }
  }, [courseFromRedux]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
             name === 'price' ? { $numberDecimal: value } : 
             value
    }));
  }



  const handleSubmit =async (e) => {
    e.preventDefault();
    try {
      
      const response=await axios.put(`http://localhost:3000/course/edit-course/${courseFromRedux._id}`,{course})
      
      dispatch(updateCourse(response.data.course));
      toast.success("Course updated successfully");
  
    } catch (error) {
      console.log(error);
      if(error.response){
        toast.error(error.response?.data?.message || "Error updating course");
      }
    }
    
  }

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
          <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
            <div>
              <h1 className="text-xl font-semibold">Edit Course</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300"
                  placeholder="Search"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <img
                crossOrigin="anonymous"
                src={tutor.profileImg || defProfile}
                className="w-12 h-12 rounded-full"
                alt=""
              />
            </div>
          </header>

          {/* View course Content */}
            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    
        <div className="p-6">
          <form  onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  id="language"
                  value={course.language}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
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
                    <option>Weeks</option>
                    <option>Months</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                Thumbnail
              </label>
              <div className="mt-1 flex items-center">
                <div className="w-64 aspect-video rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="Course thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  type="button"
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
              <label htmlFor="isListed" className="ml-2 block text-sm text-gray-900">
                List this course publicly
              </label>
            </div>

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Lessons</h3>
              <div className="mt-2 border-t border-gray-200 pt-4">
                {course.lessons.map((lesson, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">Lesson {index + 1}</span>
                    </div>
                    <div className="flex items-center">
                      <button type="button" className="text-orange-600 hover:text-orange-800">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button type="button" className="ml-2 text-red-600 hover:text-red-800">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
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
      </div>
    </>
  );

}


export default TutorEditCourse;
