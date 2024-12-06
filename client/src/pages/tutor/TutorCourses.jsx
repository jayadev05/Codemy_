import { Bell, Search } from "lucide-react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useSelector } from "react-redux";
import { selectTutor } from "../../store/tutorSlice";
import defProfile from '../../assets/user-profile.png'
import Pagination from "../../components/utils/Pagination";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function TutorCourses() {

    const tutor=useSelector(selectTutor);

    const [courses,setCourses]=useState([]);

    const fetchmyCourses=async()=>{
        try {
                const response=await axios.get(`http://localhost:3000/course/tutor-courses/${tutor._id}`) ;
                setCourses(response.data.courses);

        } catch (error) {
            console.log(error);
            toast.error(error.response.message || error.message)
        }
    }

    useEffect(()=>{
        fetchmyCourses()
    },[tutor._id])

    console.log(courses);


    return (

        <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
     <Sidebar activeSection={"My Courses"}/>
  
        {/* Main Content */}
        <main className="w-full">
          {/* Header */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
            <div>
              <h1 className="text-xl font-semibold">My Courses</h1>
              <p className="text-sm text-gray-500">Good Morning</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300" placeholder="Search" />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <img crossOrigin="anonymous" src={tutor.profileImg || defProfile} className="w-12 h-12 rounded-full" alt="" />
  
             
             
             
            </div>
          </header>
  
           {/* Filters */}
           <div className="my-6 ml-24 flex gap-4">
              <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                <option>Latest</option>
                <option>Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                <option>All Category</option>
                <option>Development</option>
                <option>Design</option>
                <option>Business</option>
              </select>
              <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                <option>4 Star & up</option>
                <option>3 Star & up</option>
                <option>2 Star & up</option>
                <option>1 Star & up</option>
              </select>
            </div>
    
            {/* Course Grid */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mx-24">
  {courses.map((course) => (
    <div key={course._id} className="overflow-hidden rounded-lg bg-white shadow">
      <div className="aspect-video w-full">
        <img
          src={course.thumbnail}
          alt="Course thumbnail"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
          {course.category}
        </span>
        <h3 className="mt-2 line-clamp-2 font-medium">
          {course.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex text-orange-400">
            {"★".repeat(Math.floor(course.averageRating))}
            {"☆".repeat(5 - Math.floor(course.averageRating))}
          </div>
          <span className="text-sm text-gray-500">{course.averageRating}</span>
          <span className="text-sm text-gray-500">
            ({course.enrolleeCount} students)
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold">₹{course.price.$numberDecimal}</span>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            •••
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
    
            {/* Pagination */}
            {/* <Pagination /> */}
        </main>
      </div>
    )
  }
  
  