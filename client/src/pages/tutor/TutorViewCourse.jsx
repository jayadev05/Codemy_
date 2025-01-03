"use client"

import { Bell, Search } from 'lucide-react'
import { useSelector } from "react-redux"
import { selectCourse } from "../../store/slices/courseSlice"
import { selectTutor } from "../../store/slices/tutorSlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Sidebar from "../../components/layout/tutor/Sidebar"
import { CourseStats } from '@/components/layout/tutor/courseDetails/CourseStats'
import { CourseRatingOverview } from '@/components/layout/tutor/courseDetails/CourseRatings'
import { CourseReviews } from '@/components/layout/tutor/courseDetails/CourseReviews'
import { useEffect, useState } from 'react'
import axiosInstance from '@/config/axiosConfig'


function TutorViewCourse() {
  const tutor = useSelector(selectTutor)
  const course = useSelector(selectCourse)
  const [reviews,setReviews]=useState([]);

  console.log("Reviews",reviews)

  const ratings = course.ratings.length > 0 ? course.ratings : [0]

  useEffect(()=>{

    const fetchReviews=async()=>{
      try {
        const response = await axiosInstance.get(`/tutor/get-reviews/${course._id}`);
    
        setReviews(response.data.reviews);

      } catch (error) {
        console.log(error)
      }
    }

    fetchReviews();

  },[])

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "")
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : ""
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="My Courses" />
      </div>

      <main className="flex-1">
       <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
              <div>
                <h1 className="text-xl ml-12 lg:ml-0 font-semibold">My Courses</h1>
                <p className="text-sm text-gray-500">Good Morning</p>
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
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  src={tutor.profileImg || defProfile}
                  className="w-12 h-12 rounded-full"
                  alt=""
                />
              </div>
            </header>

        <div className="space-y-6 p-6">
          <Card>
            <CardContent className="flex flex-col gap-6 p-6 md:flex-row">
              <div className="w-full md:w-1/3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="aspect-video w-full rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <CardDescription>
                  Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                </CardDescription>
                <CardTitle className="mb-4 mt-2 text-2xl">
                  {course.title}
                </CardTitle>
                <div className="text-lg font-bold">
                  ₹{formatCurrency(course.price.$numberDecimal)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    Course price
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <CourseStats course={course} />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <CourseRatingOverview ratings={ratings} />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <CourseReviews reviews={reviews} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default TutorViewCourse

