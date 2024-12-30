'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Bell, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, Coins, School } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice"
import Sidebar from "../../components/layout/admin/sidebar"
import { CoursesTable } from "@/components/layout/admin/CourseManage"
import { PayoutRequests } from "@/components/layout/admin/PayoutManage"

import axiosInstance from "@/config/axiosConfig"



export function StatsCards({activeCourses,totalRevenue}) {

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const stats = [
    {
      title: "Total Students",
      value: "134",
      icon: GraduationCap,
      color: "text-blue-500",
    },
    {
      title: "Active Courses",
      value: activeCourses,
      icon: BookOpen,
      color: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: `₹${formatCurrency(totalRevenue)}`,
      icon: Coins,
      color: "text-yellow-500",
    },
    {
      title: "Total Tutors",
      value: "8",
      icon: School,
      color: "text-purple-500",
    },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [courses, setCourses] = useState([])
  const [payoutRequests, setPayoutRequests] = useState([])
  const [sortBy, setSortBy] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const admin = useSelector(selectAdmin)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const activeCourses = courses.filter((course)=> course.isListed).length;
  const totalRevenue = courses.reduce((sum,course)=> sum + (course.enrolleeCount * course.price.$numberDecimal) ,0);
 

  useEffect(() => {
    fetchData()
  }, [sortBy])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [coursesRes, payoutsRes] = await Promise.allSettled([
        axiosInstance.get("/course/get-courses", {
          params: { sortBy },
        }),
        axiosInstance.get("/admin/payout-requests")
      ])
      

      setCourses(coursesRes.value.data.courses)
      setPayoutRequests(payoutsRes.value.data.payoutRequests)

    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/admin/logout")
      dispatch(logoutAdmin(admin))
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (error) {
      toast.error(error.message || "Error logging out")
    }
  }

  const handleToggleList = async (id, isListed) => {
    try {
      const endpoint = isListed ? "unlistCourse" : "listCourse"
      await axiosInstance.put(`/admin/${endpoint}/${id}`)
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === id ? { ...course, isListed: !course.isListed } : course
        )
      )
      toast.success(
        isListed ? "Course Unlisted Successfully" : "Course Listed Successfully"
      )
    } catch (error) {
      toast.error("Failed to update course status")
    }
  }

  const handleDeleteCourse = async (courseId, tutorId) => {
    try {
      await axiosInstance.delete(
        `/course/delete-course?courseId=${courseId}&tutorId=${tutorId}`
      )
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== courseId)
      )
      return true
    } catch (error) {
      throw error
    }
  }

  const handleApprovePayout = async (requestId,action) => {
    try {
      await axiosInstance.put(`http://localhost:3000/admin/handle-payout`,{requestId,action});
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'approved' } : req
        )
      )
      return true
    } catch (error) {
      console.log(error)
    }
  }

  const handleRejectPayout = async (requestId,action) => {
    try {
      await axiosInstance.put(`http://localhost:3000/admin/handle-payout`,{requestId,action});
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'rejected' } : req
        )
      )
      return true
    } catch (error) {
   console.log(error)
    }
  }

  

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="Dashboard" />
      </div>

      <main className="flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
                     <div>
                       <h1 className="text-3xl font-bold">Dashboard</h1>
                       <p className="text-md text-muted-foreground">Good Morning</p>
                       
                     </div>
                     <div className="flex items-center gap-4">
                       
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
                           <div className="absolute right-0 z-10  w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                             <div className="px-4 py-2 border-b">
                               <p className="text-sm font-medium text-gray-900">
                                 {admin?.userName}
                               </p>
                               <p className="text-sm text-gray-500 truncate">
                                 {admin?.email}
                               </p>
                             </div>
           
                             <a
                             
                               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                             >
                               Profile
                             </a>
                             <a
                           
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

        <div className="space-y-6 p-6 pb-16">
          <StatsCards activeCourses={activeCourses} totalRevenue={totalRevenue} />

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-4">
              <CoursesTable
                courses={courses}
                onToggleList={handleToggleList}
                onDelete={handleDeleteCourse}
                onSort={setSortBy}
              />
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              <PayoutRequests
                requests={payoutRequests}
                onApprove={handleApprovePayout}
                onReject={handleRejectPayout}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

