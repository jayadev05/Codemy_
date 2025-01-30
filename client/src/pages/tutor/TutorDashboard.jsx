import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, Star, Users, Search, Bell } from "lucide-react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { logoutTutor, selectTutor } from "../../store/slices/tutorSlice";
import defProfile from "../../assets/user-profile.png";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { WithdrawDialog } from "@/components/layout/tutor/WithdrawalModal";
import { WithdrawalHistory } from "@/components/layout/tutor/WithdrawalHistory";
import axiosInstance from "@/config/axiosConfig";
import TutorHeader from "@/components/layout/tutor/TutorHeader";


const chartData = [
  { name: "Mon", value1: 70, value2: 120, value3: 90 },
  { name: "Tue", value1: 110, value2: 130, value3: 100 },
  { name: "Wed", value1: 120, value2: 110, value3: 110 },
  { name: "Thu", value1: 130, value2: 90, value3: 120 },
  { name: "Fri", value1: 90, value2: 100, value3: 130 },
  { name: "Sat", value1: 100, value2: 120, value3: 120 },
  { name: "Sun", value1: 110, value2: 130, value3: 110 },
];

const StatCard = ({ icon: Icon, label, value, iconColor, iconBg }) => (
  <div className="rounded-lg border bg-white p-6 flex items-center gap-4">
    {Icon && (
      <div className={`rounded-lg p-2 ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    )}
    <div>
      <p className="text-sm text-gray-500">{label || "N/A"}</p>
      <p className="text-2xl font-semibold">{value || 0}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const tutorState = useSelector(selectTutor);
  const [tutor, setTutor] = useState({});
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [payoutsHistory, setPayoutsHistory] = useState([]);

  const [totalReviews, setTotalReviews] = useState(null);
  const [myCourses, setMyCourses] = useState(null);
  const [totalStudents, setTotalStudents] = useState(null);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchPayoutHistory = async () => {
      if (!tutorState._id) {
        console.log("Tutor ID is missing");
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/tutor/payouts/${tutorState._id}/history`
        );
        setPayoutsHistory(response.data.payouts);
      } catch (error) {
        console.log("Error fetching payout history:", error);
      }
    };

    const fetchTutorDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/tutor/tutor/${tutorState._id}`
        );
        setTutor(response.data.tutor);
        setTotalReviews(response.data.totalReviews);
        setMyCourses(response.data.myCourses);
        setTotalStudents(response.data.totalStudents);
        setAverageRating(response.data.averageRating);
      } catch (error) {
        console.log("Error fetching payout history:", error);
      }
    };

    fetchTutorDetails();
    fetchPayoutHistory();
  }, [tutor._id, withdrawDialogOpen]);

  const getDecimalValue = (decimalObj) => {
    if (!decimalObj) return 0;
    return parseFloat(decimalObj.$numberDecimal || 0);
  };

  const totalRevenue = getDecimalValue(tutor.totalRevenue);
  const amountWithdrawn = getDecimalValue(tutor.amountWithdrawn);
  const availableBalance = totalRevenue - amountWithdrawn;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}

      <div className="sticky top-0 h-screen">
        <Sidebar activeSection={"Dashboard"} />
      </div>

      {/* Main Content */}
      <main className="w-full">
        {/* Header */}
        <TutorHeader heading="Dashboard" subheading="Good Morning" />

        {/* Dashboard Content */}
        <div className="px-8 mt-5">
          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-3 gap-6">
            <StatCard
              icon={BookOpen}
              label="My Courses"
              value={myCourses}
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />

            <StatCard
              icon={Users}
              label="Students Enrolled"
              value={totalStudents}
              iconColor="text-yellow-500"
              iconBg="bg-yellow-50"
            />

            <StatCard
              label="total Reviews"
              value={totalReviews}
              iconColor="text-red-500"
              iconBg="bg-red-50"
            />
          </div>

          {/* Financial Stats */}
          <div className="mb-6 grid grid-cols-3 gap-6">
            <StatCard
              label="Total Revenue"
              value={`₹ ${totalRevenue.toLocaleString()}`}
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
            <StatCard
              label="Total Withdrawals"
              value={`₹ ${amountWithdrawn.toLocaleString()}`}
              iconColor="text-purple-500"
              iconBg="bg-purple-50"
            />
            <div className="flex items-center justify-between rounded-lg border bg-white p-6">
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-semibold">
                  ₹ {availableBalance.toLocaleString()}
                </p>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setWithdrawDialogOpen(true)}
              >
                Withdraw
              </Button>
            </div>
          </div>

          {/* Course Rating & Chart */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold"> Average Course Rating</h3>
                <select className="rounded-md border px-2 py-1 text-sm">
                  <option>This week</option>
                </select>
              </div>
              <div className="mb-6 flex items-end gap-4">
                <div className="text-4xl font-bold">
                  {averageRating?.toFixed(1)}
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { stars: 5, percentage: 46 },
                  { stars: 4, percentage: 32 },
                  { stars: 3, percentage: 8 },
                  { stars: 2, percentage: 7 },
                  { stars: 1, percentage: 2 },
                ].map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-2">
                    <div className="flex w-24 items-center gap-1 text-sm text-yellow-400">
                      {rating.stars}
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500">
                      {rating.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Course Bought Overview</h3>
                <select className="rounded-md border px-2 py-1 text-sm">
                  <option>This week</option>
                </select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value1"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="value2"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="value3"
                      stroke="#ffc658"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <WithdrawalHistory withdrawals={payoutsHistory} />
          </div>
        </div>
      </main>
      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        availableBalance={availableBalance}
        tutorId={tutor._id}
      />
    </div>
  );
};

export default Dashboard;
