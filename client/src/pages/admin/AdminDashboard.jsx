"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Bell, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Coins, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import Sidebar from "../../components/layout/admin/sidebar";
import { CoursesTable } from "@/components/layout/admin/CourseManage";
import { PayoutRequests } from "@/components/layout/admin/PayoutManage";

import axiosInstance from "@/config/axiosConfig";
import AdminHeader from "@/components/layout/admin/AdminHeader";

export function StatsCards({
  activeCourses,
  totalRevenue,
  totalStudents,
  totalTutors,
}) {
  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
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
      value: totalTutors,
      icon: School,
      color: "text-purple-500",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [sortBy, setSortBy] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const admin = useSelector(selectAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activeCourses = courses.filter((course) => course.isListed).length;
  const totalRevenue = courses.reduce(
    (sum, course) => sum + course.enrolleeCount * course.price.$numberDecimal,
    0
  );
  const [totalStudents, setTotalStudents] = useState(null);
  const [totalTutors, setTotalTutors] = useState(null);



  useEffect(() => {
    fetchData();
  }, [sortBy]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, payoutsRes] = await Promise.allSettled([
        axiosInstance.get("/course/courses", {
          params: { sortBy },
        }),
        axiosInstance.get("/admin/payout-requests"),
      ]);

      setCourses(coursesRes.value.data.courses);
      setTotalStudents(coursesRes.value.data.totalStudents);
      setTotalTutors(coursesRes.value.data.totalTutors);

      setPayoutRequests(payoutsRes.value.data.payoutRequests);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleList = async (id, isListed) => {
    try {
      const endpoint = isListed ? "unlist" : "list";
      await axiosInstance.put(`/admin/course/${id}/${endpoint}`);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === id ? { ...course, isListed: !course.isListed } : course
        )
      );
      toast.success(
        isListed ? "Course Unlisted Successfully" : "Course Listed Successfully"
      );
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleDeleteCourse = async (courseId, tutorId) => {
    try {
      await axiosInstance.delete(
        `/course/course?courseId=${courseId}&tutorId=${tutorId}`
      );
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== courseId)
      );
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleApprovePayout = async (requestId, action) => {
    try {
      await axiosInstance.put(`/admin/handle-payout`, { requestId, action });
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "approved" } : req
        )
      );
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  const handleRejectPayout = async (requestId, action) => {
    try {
      await axiosInstance.put(`/admin/handle-payout`, { requestId, action });
      setPayoutRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" } : req
        )
      );
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="Dashboard" />
      </div>

      <main className="flex-1">
        <AdminHeader heading="Dashboard" subheading="Good Morning" />

        <div className="space-y-6 p-6 pb-16">
          <StatsCards
            activeCourses={activeCourses}
            totalRevenue={totalRevenue}
            totalStudents={totalStudents}
            totalTutors={totalTutors}
          />

          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white relative "
              >
                Payout Requests
                {payoutRequests.filter((p) => p.status === "pending").length >
                  0 && (
                  <span className="absolute -top-1 -right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {
                      payoutRequests.filter((p) => p.status === "pending")
                        .length
                    }
                  </span>
                )}
              </TabsTrigger>
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
  );
}
