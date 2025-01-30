"use client";

import { Bell, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCourse } from "../../store/slices/courseSlice";
import { selectTutor } from "../../store/slices/tutorSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Sidebar from "../../components/layout/tutor/Sidebar";
import { CourseStats } from "@/components/layout/tutor/courseDetails/CourseStats";
import { CourseRatingOverview } from "@/components/layout/tutor/courseDetails/CourseRatings";
import { CourseReviews } from "@/components/layout/tutor/courseDetails/CourseReviews";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axiosConfig";
import TutorHeader from "@/components/layout/tutor/TutorHeader";

function TutorViewCourse() {
  const tutor = useSelector(selectTutor);
  const course = useSelector(selectCourse);
  const [reviews, setReviews] = useState([]);

  console.log("Reviews", reviews);

  const ratings = course.ratings.length > 0 ? course.ratings : [0];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(
          `/tutor/reviews/${course._id}`
        );

        setReviews(response.data.reviews);
      } catch (error) {
        console.log(error);
      }
    };

    fetchReviews();
  }, []);

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="My Courses" />
      </div>

      <main className="flex-1">
        <TutorHeader heading="Course Details" />

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
                  Last updated:{" "}
                  {new Date(course.updatedAt).toLocaleDateString()}
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
  );
}

export default TutorViewCourse;
