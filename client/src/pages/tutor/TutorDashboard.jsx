import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BookOpen,  Star, Users, Search, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/tutor/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { logoutTutor, selectTutor } from '../../store/slices/tutorSlice';
import defProfile from '../../assets/user-profile.png'
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';

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
      <p className="text-sm text-gray-500">{label || 'N/A'}</p>
      <p className="text-2xl font-semibold">{value || 'N/A'}</p>
    </div>
  </div>
);

const Dashboard = () => {

  const tutor =useSelector(selectTutor);
  const navigate=useNavigate();
  const dispatch=useDispatch();

 

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
   <Sidebar activeSection={"Dashboard"}/>

      {/* Main Content */}
      <main className="w-full">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
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
            <img  referrerPolicy="no-referrer" crossOrigin="anonymous" src={tutor.profileImg || defProfile} className="w-12 h-12 rounded-full" alt="" />

           
           
           
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-8 mt-5">
          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-4 gap-6">
            <StatCard
              icon={BookOpen}
              label="My Courses"
              value="17"
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
          
            <StatCard
              icon={Users}
              label="Students Enrolled"
              value="241"
              iconColor="text-yellow-500"
              iconBg="bg-yellow-50"
            />
            <StatCard
              icon={BookOpen}
              label="Completed Courses"
              value="12"
              iconColor="text-green-500"
              iconBg="bg-green-50"
            />
             <StatCard
              label="total Reviews"
              value="125"
              iconColor="text-red-500"
              iconBg="bg-red-50"
            />
          </div>



          {/* Financial Stats */}
          <div className="mb-6 grid grid-cols-3 gap-6">
            <StatCard
              label="Total Revenue"
              value="₹165,804"
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
            <StatCard
              label="Total Withdrawals"
              value="₹132,184"
              iconColor="text-purple-500"
              iconBg="bg-purple-50"
            />
            <div className="flex items-center justify-between rounded-lg border bg-white p-6">
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-semibold">₹18,184</p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Withdraw Money
              </button>
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
                <div className="text-4xl font-bold">4.6</div>
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
                    <Line type="monotone" dataKey="value1" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="value2" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="value3" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

