import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header'
import MainHeader from '../../components/layout/user/MainHeader';
import UserProfile from '../../components/layout/user/UserDetails';
import Tabs from '../../components/layout/user/Tabs';
import SecondaryFooter from '../../components/layout/user/SecondaryFooter';
import { Heart, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectWishlist } from '../../store/slices/wishlistSlice';
import { selectCart } from '../../store/slices/cartSlice';
import { selectUser } from '../../store/slices/userSlice';
import axios from 'axios';



const CourseCard = ({ title, description, progress, image }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 max-w-sm">
    <img src={image} alt={title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2 truncate">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-orange-500 rounded-full" 
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">{progress}% Complete</p>
      </div>
      <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300">
        {progress===0?"Start Course" :"Continue Course"}
      </button>
    </div>
  </div>
)

const Courses = () => {

  const user=useSelector(selectUser);

  // const courses = [
  //   {
  //     title: "Learn More About Web Design",
  //     description: "Learn Official Guide from Codemy",
  //     progress: 40,
  //     image: "/placeholder.svg?height=200&width=300"
  //   },
  //   {
  //     title: "User Experience Design 3: Create...",
  //     description: "UX/UI Web Design Master Course",
  //     progress: 16,
  //     image: "/placeholder.svg?height=200&width=300"
  //   },
  //   {
  //     title: "Adding Content to Our Website",
  //     description: "Complete Web Design: From Figma to Webflow",
  //     progress: 25,
  //     image: "/placeholder.svg?height=200&width=300"
  //   },
  //   {
  //     title: "CSS Font Property Challenge Solution",
  //     description: "Modern Frontend Development Course",
  //     progress: 0,
  //     image: "/placeholder.svg?height=200&width=300"
  //   }
  // ]

  const [courses,setCourses]=useState([]);

  console.log(courses)

  useEffect(()=>{
    const fetchCourseByUserId=async()=>{
      try {
        const response= await axios.get(`http://localhost:3000/course/student-courses/${user._id}`);

        setCourses(response.data.courses);

      } catch (error) {
        console.log("Error fetching course",error)
      }
    }

    fetchCourseByUserId()

  },[]);

  console.log(courses)

  return (
    <div className="container px-12 py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Courses ({courses.length})</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search in your courses..."
            className="px-4 py-2 border rounded-lg text-sm"
          />
          {['Latest', 'All Courses', 'All Teachers'].map((option) => (
            <select key={option} className="px-4 py-2 border rounded-lg text-sm">
              <option>{option}</option>
            </select>
          ))}
        </div>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course, index) => (
          <div
            key={course._id}
            className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
          >
            <div className="relative aspect-[3/2] w-full">
              <img
                src={course.thumbnail}
                alt={`${course.title} thumbnail`}
                className="h-full w-full object-cover"
              />
             
               
             
            </div>
            <div className="flex flex-col flex-grow p-4">
              <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 flex-grow">
                {course.title}
              </h3>
            

              {/* Progress Section */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Course Progress
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {course?.progress.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-600 h-2.5 rounded-full" 
                    style={{ width: `${course?.progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Start/Continue Course Button */}
              <div className="mt-4">
                {course?.progress.progressPercentage === 0 ? (
                  <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center">
                    <Play className="mr-2 w-5 h-5" /> Start Course
                  </button>
                ) : (
                  <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center">
                    <Play className="mr-2 w-5 h-5" /> Continue Course
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





export default function UserDashboard() {
  
 const wishlist=useSelector(selectWishlist)
 const cart=useSelector(selectCart);

  return (
    <div className="bg-gray-100 min-h-screen  flex flex-col">
      <Header/>
      <MainHeader cart={cart} />
      <main className="flex-grow mb-4">
      
        <Tabs />
        <Courses />
      
      </main>
      <SecondaryFooter/>
    </div>
  )
}

