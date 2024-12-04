import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import MainHeader from '../../components/layout/user/MainHeader';
import UserProfile from '../../components/layout/user/UserDetails';
import Tabs from '../../components/layout/user/Tabs';



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
  const courses = [
    {
      title: "Learn More About Web Design",
      description: "Learn Official Guide from Codemy",
      progress: 40,
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "User Experience Design 3: Create...",
      description: "UX/UI Web Design Master Course",
      progress: 16,
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "Adding Content to Our Website",
      description: "Complete Web Design: From Figma to Webflow",
      progress: 25,
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "CSS Font Property Challenge Solution",
      description: "Modern Frontend Development Course",
      progress: 0,
      image: "/placeholder.svg?height=200&width=300"
    }
  ]
  
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Courses (8)</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </div>
  )
}



export default function UserDashboard() {
  

  return (
    <div className="bg-gray-100 min-h-screen  flex flex-col">
      <Header/>
      <MainHeader />
      <main className="flex-grow mb-4">
        <UserProfile />
        <Tabs />
        <Courses />
      
      </main>
      <footer className="bg-white mt-auto fixed bottom-0 right-0 left-0 ">
    <div className=" mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm text-gray-500 mb-2 sm:mb-0">© 2021 - Eduguard. Designed by Templatecookie. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            FAQs
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
            Terms & Condition
          </a>
        </div>
      </div>
    </div>
  </footer>
    </div>
  )
}

