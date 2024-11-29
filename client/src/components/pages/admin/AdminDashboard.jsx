'use client'

import { Bell, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import Sidebar from './partials/sidebar'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAdmin, selectAdmin } from '../../../store/adminSlice'

export default function Dashboard() {
  const [courseFilter, setCourseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 5

  const admin=useSelector(selectAdmin);
  const dispatch=useDispatch();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: '👥' },
    { title: 'Active Courses', value: '12', icon: '📚' },
    { title: 'Total Revenue', value: '$15,000', icon: '💰' },
    { title: 'Course Rating', value: '4.8', icon: '⭐' },
  ]

  const courses = [
    {
      id: 1,
      title: 'Introduction to Python',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Sarah Johnson',
      students: 234,
      price: '$99.99',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Web Development Basics',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Michael Chen',
      students: 189,
      price: '$89.99',
      status: 'Active'
    },
    {
      id: 3,
      title: 'UI/UX Design',
      image: '/placeholder.svg?height=200&width=300',
      instructor: 'Emma Wilson',
      students: 156,
      price: '$79.99',
      status: 'Draft'
    },
  ]

  const filteredCourses = courseFilter === 'all'
    ? courses
    : courses.filter(course => course.status === courseFilter)

  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  console.log(admin);
  return (
    
    <div className="flex min-h-screen bg-gray-50 ">
      {/* Sidebar */}
      <Sidebar activeSection="Dashboard" onLogout={()=>dispatch(logoutAdmin(admin))} />

      {/* Main Content */}
      <main className="flex-1 ml-62 p-12">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow">
          <div className="flex items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 "
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative rounded-full p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <div className="flex items-center gap-2">
                <img
                  src=''
                  alt="User avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-8 mt-6">
          <h1 className="text-2xl font-bold text-gray-900 ">Dashboard Overview</h1>

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
                  <option value="active">Active Only</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
             
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500 ">
                    <th className="pb-3 pl-4">Course</th>
                    <th className="pb-3">Instructor</th>
                    <th className="pb-3">Students</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {paginatedCourses.map((course) => (
                    <tr key={course.id} className="text-sm">
                      <td className="py-4 pl-4">
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
                      <td className="py-4 text-gray-900 ">{course.price}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          course.status === 'Active'
                            ? 'bg-green-100 text-green-700 '
                            : 'bg-yellow-100 text-yellow-700 '
                        }`}>
                          {course.status}
                        </span>
                      </td>
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
            <div className="mt-4 flex items-center justify-between border-t pt-4 ">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border px-3 py-1 text-sm font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 ">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * coursesPerPage >= filteredCourses.length}
                className="rounded-lg border px-3 py-1 text-sm font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}