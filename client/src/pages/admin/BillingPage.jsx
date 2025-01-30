import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Bell, Download } from "lucide-react";
import { logoutAdmin, selectAdmin } from "@/store/slices/adminSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Sidebar from "@/components/layout/admin/sidebar";
import Pagination from "@/components/utils/Pagination";
import axiosInstance from "@/config/axiosConfig";
import DateRangePicker from "@/components/layout/admin/DateRangePicker";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/layout/admin/AdminHeader";
import useCurrencyFormat from "@/hooks/UseCurrencyFormat";

const BillingPage = () => {
  const admin = useSelector(selectAdmin);

  // Sample data for charts
  const monthlyRevenue = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 2000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
  ];

  

  const [orders, setOrders] = useState([]);



  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const dataPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get(`/admin/orders`);

        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };

    fetchOrders();
  }, [admin._id]);

  const formatCurrency = (num) => {
    const cleanedNum = num?.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await axiosInstance.get(
        `/admin/orders/${orderId}/invoice`,
        {
          responseType: "blob",
        }
      );

      // Create a URL for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${orderId}.pdf`); // Specify the filename
      document.body.appendChild(link);

      // Simulate a click on the link to trigger the download
      link.click();

      // Clean up the temporary link
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
      toast.error("Failed to download order invoice");
    }
  };

  const calculateCourseDistribution = (orders = []) => {
    const revenuePerCategory = orders.reduce((acc, order) => {
      order.courses?.forEach((course) => {
        const categoryTitle = course.categoryId?.title || "Unknown Category";
        const courseRevenue = parseFloat(course.price?.$numberDecimal || 0);
  
        acc[categoryTitle] = (acc[categoryTitle] || 0) + courseRevenue;
      });
      return acc;
    }, {});
  
    return Object.entries(revenuePerCategory).map(([name, value]) => ({
      name,
      value,
    }));
  };
  

  const courseDistribution = calculateCourseDistribution(orders);


  const paginateData = (data) => {
    const startIndex = currentPage * dataPerPage - dataPerPage;
    const endIndex = startIndex + dataPerPage;
    return data.slice(startIndex, endIndex);
  };

  const paginatedOrders = paginateData(orders);

  const totalRevenue = orders
    .filter((order) => order.orderStatus === "Completed")
    .reduce((acc, order) => acc + order.totalAmount, 0);

  const totalCoursesSold = orders.filter(
    (order) => order.orderStatus === "Completed"
  ).length;

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  return (
    <div className="flex">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection="Billing" />
      </div>

      <div className="flex-1">
        <AdminHeader heading="Billing" subheading="Manage orders and view financial insights"/>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-end items-center">
                <DateRangePicker />
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  ₹ {formatCurrency( totalRevenue / 100) }
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    20.1%
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    vs last month
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">
                  Active Orders
                </h3>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    12%
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    vs last week
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">
                  Pending Payments
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Courses Sold
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCoursesSold}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    8%
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    vs last month
                  </span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Revenue Overview
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#eb5a0c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Course Sales Distribution
                </h3>
                <div className="h-80">
                <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={courseDistribution}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {courseDistribution.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Orders
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                className="h-10 w-10 rounded-full"
                                src={order.userId?.profileImg}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.userId?.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.orderId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.courses.map((course)=>course.categoryId.title).join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{order.totalAmount / 100}
                          </div>
                          {order.discount?.discountAmount > 0 && (
                            <div className="text-xs text-gray-500">
                              Discount: ₹{order.discount?.discountAmount}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.orderStatus === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.orderStatus === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.payment.paymentMethod}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.payment.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          
                          <Button
                            variant="ghost"
                            onClick={() => downloadInvoice(order._id)}
                            size="sm"
                            className="flex items-center gap-2 text-[#FF6B35] hover:text-[#FF6B35]/80 hover:bg-[#FF6B35]/10 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Invoice</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
          {/* Pagination */}
          <Pagination
            className="flex justify-center mb-12"
            dataPerPage={dataPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            totalData={orders.length}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
