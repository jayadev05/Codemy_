import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import Tabs from "../../components/layout/user/Tabs";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import { Heart, Play, Download, Loader2, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectWishlist } from "../../store/slices/wishlistSlice";
import { selectCart } from "../../store/slices/cartSlice";
import { selectUser } from "../../store/slices/userSlice";
import axios from "axios";
import { setCurrentCourse } from "@/store/slices/courseSlice";
import axiosInstance from "@/config/axiosConfig";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Courses = () => {
  const user = useSelector(selectUser);
  const [courses, setCourses] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId=user._id

  useEffect(() => {
    const fetchCourseByUserId = async () => {
      try {
        const response = await axiosInstance.get(
          `http://localhost:3000/course/user-courses/${userId}`
        );

        setCourses(response.data.courses);
      } catch (error) {
        console.log("Error fetching course", error);
      }
    };

    fetchCourseByUserId();
  }, [user._id]);

  const handleDownloadCertificate = async (courseId, courseName) => {
    // Create a loading state for this specific course
    setLoadingCertificates((prev) => ({ ...prev, [courseId]: true }));

    try {
      const response = await axiosInstance.post(
        `http://localhost:3000/course/certificate/generate`,
        {
          userId: user._id,
          courseId,
          courseName,
        }
      );

      if (response.data.success) {
        window.open(response.data.certificateUrl, "_blank");
      }
    } catch (error) {
      console.error("Certificate error:", error);
      alert("Failed to process certificate");
    } finally {
      // Remove loading state for this course
      setLoadingCertificates((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handlePlayCourse = (courseId) => {
    dispatch(setCurrentCourse(courseId));
    navigate(`/user/play-course`);
  };

  return (
    <div className="container px-6 py-4 lg:px-12 lg:py-8 min-h-[500px]">

      {/* search and filter */}
    
<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
  <h3 className="text-xl font-semibold shrink-0">
    Courses ({courses.length})
  </h3>
  
  <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:w-auto">
    <div className="relative w-full sm:w-[240px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search courses..."
        className="pl-9 w-full"
        aria-label="Search courses"
      />
    </div>
    
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:overflow-visible sm:pb-0 sm:px-0">
      {["Latest", "All Courses", "All Teachers"].map((option) => (
        <Select key={option}>
          <SelectTrigger className="w-[130px] shrink-0">
            <SelectValue placeholder={option} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={option.toLowerCase()}>{option}</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  </div>
</div>


      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
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
              {course?.progress?.progressPercentage === 100 ? (
                <div className="mt-3 text-green-500 text-center font-medium">
                  Course completed 🎉
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Course Progress
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {Math.floor(course?.progress?.progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full"
                      style={{
                        width: `${course?.progress?.progressPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Course Action Buttons */}
              <div className="mt-4">
                {course?.progress?.progressPercentage === 0 ? (
                  <button
                    onClick={() => handlePlayCourse(course._id)}
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                  >
                    <Play className="mr-2 w-5 h-5" /> Start Course
                  </button>
                ) : course?.progress?.progressPercentage === 100 ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePlayCourse(course._id)}
                      className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                    >
                      <Play className="mr-2 w-5 h-5" /> Watch Again
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadCertificate(course._id, course.title)
                      }
                      disabled={loadingCertificates[course._id]}
                      className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {loadingCertificates[course._id] ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 w-5 h-5" /> Download
                          Certificate
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlayCourse(course._id)}
                    className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
                  >
                    <Play className="mr-2 w-5 h-5" /> Continue Course
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const wishlist = useSelector(selectWishlist);
  const cart = useSelector(selectCart);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <MainHeader cart={cart} />
      <main className="flex-grow mb-4">
        <Tabs />
        <Courses />
      </main>
      <SecondaryFooter />
    </div>
  );
}
