'use client'

import { Bell, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import Sidebar from './partials/sidebar'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAdmin, selectAdmin } from '../../store/adminSlice'
import { useNavigate } from 'react-router'
import defProfile from "../../assets/user-profile.png";
import Pagination from '../../components/utils/Pagination'

export default function Dashboard() {
  const [courseFilter, setCourseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [coursesPerPage] = useState(3)

  const admin=useSelector(selectAdmin);


  const dispatch=useDispatch();

  const navigate=useNavigate();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: '👥' },
    { title: 'Active Courses', value: '12', icon: '📚' },
    { title: 'Total Revenue', value: '₹150,000', icon: '💰' },
    { title: 'Course Rating', value: '4.8', icon: '⭐' },
  ]

  const courses = [
    {
      id: 1,
      title: 'Introduction to Python',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Sarah Johnson',
      students: 234,
      price: 1299,
      enrollCount:27,
      status: 'Active'
    },
    {
      id: 2,
      title: 'Web Development Basics',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Michael Chen',
      students: 189,
      price: 899,
      enrollCount:17,
      status: 'Active'
    },
    {
      id: 3,
      title: 'UI/UX asdasdDesign',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Emma Wilson',
      students: 156,
      price: 1499,
      enrollCount:12,
      status: 'Draft'
    },
    
  ]


    const paginateData = (data) => {
      const startIndex = currentPage * coursesPerPage - coursesPerPage;
      const endIndex = startIndex + coursesPerPage;
      return data.slice(startIndex, endIndex);
    };
 
const handleLogout=async()=>{
  try {
    await axios.post("http://localhost:3000/admin/logout");

    dispatch(logoutAdmin(admin));

    navigate('/login');

    toast.success("Logged out successfully");
  } catch (error) {
    console.log(error.message);
    toast.error(error.message || "Error Logging out user")
  }
}

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

const filteredCourses = courseFilter === 'all'
? courses
: courses.filter(course => course.status === courseFilter)

const filteredItems=paginateData(filteredCourses);



  return (
    
    <div className="flex min-h-screen bg-gray-50 ">
      {/* Sidebar */}
      <Sidebar activeSection="Dashboard" />

      {/* Main Content */}
      <main className="flex-1 ">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-2 ">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
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
           
           {/* Dropdown container */}
           <div className="relative group">
                <img
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                  src={admin?.profileImg || defProfile}
                  alt=""
                />

                {/* Dropdown menu */}
                <div className="absolute right-0  w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {admin?.userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {admin?.email}
                    </p>
                  </div>

                  <a
                    href="/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/user/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  <button
                   onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-6 mt-6 px-12">

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-6 shadow "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 ">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900 ">{stat.value}</p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Courses Table */}
          <div className="rounded-lg bg-white p-6 shadow ">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 ">Active Courses</h2>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm "
                >
                  <option value="all">All Courses</option>
                  <option value="active">Latest</option>
                  <option value="draft">Top Sellers</option>
                </select>
              </div>
             
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500 ">
                    <th className="pb-3 pl-4 w-1/4">Course</th>
                    <th className="pb-3 w-1/6">Instructor</th>
                    <th className="pb-3 w-1/6">Students</th>
                    <th className="pb-3 w-1/6"> Price</th>
                    <th className="pb-3 w-1/6">Revenue</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {filteredItems.map((course) => (
                    <tr key={course.id} className="text-sm">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.image}
                            alt={course.title}
                            width={48}
                            height={36}
                            className="rounded object-cover"
                          />
                          <span className="font-medium text-gray-900 ">{course.title}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 ">{course.instructor}</td>
                      <td className="py-4 text-gray-600 ">{course.students}</td>
                      <td className="py-4 text-gray-900 ">₹{course.price}</td>
                      <td className="py-4 text-gray-900">₹{course.students * course.price}</td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
                            Edit
                          </button>
                          <button className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination className="mt-4 flex justify-center gap-3" totalData={filteredItems.length} dataPerPage={coursesPerPage} currentPage={currentPage} setCurrentPage={handlePageChange}/>

        </div>
      </main>
    </div>
  )
}