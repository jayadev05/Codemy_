"use client";

import React, { useState, useEffect } from "react";

import axios from "axios";
import { toast } from "react-hot-toast";
import defProfile from "../../assets/user-profile.png";
import { Search, FileText, X, Bell } from "lucide-react";
import Pagination from "../../components/utils/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import Sidebar from "../../components/layout/admin/sidebar";
import { useNavigate } from "react-router";
import axiosInstance from "../../config/axiosConfig";
import AdminHeader from "@/components/layout/admin/AdminHeader";

const StudentManagement = () => {
  const admin = useSelector(selectAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/admin/students", {
        withCredentials: true,
      });
   
      setStudents(response.data.students || []);
    } catch (err) {
      setError("Failed to fetch students");

      console.error(err);
      toast.error("Failed to load students");
    }
  };

  //pagination

  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(4);

  // Pagination logic for both tutors and applications

  const paginateData = (data) => {
    const startIndex = currentPage * dataPerPage - dataPerPage;
    const endIndex = startIndex + dataPerPage;
    return data.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedItems = paginateData(filteredStudents);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden justify-center items-center bg-white text-red-500 text-xl font-semibold">
        {error}
      </div>
    );
  }

  const handleToggleList = async (id, currentStatus) => {
    try {
      const endpoint =
        currentStatus === false
          ? `/admin/user/${id}/list`
          : `/admin/user/${id}/unlist`;

      const result = await axiosInstance.put(endpoint, {
        withCredentials: true,
      });

      // Update the student state to reflect the new status

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === id
            ? { ...student, isActive: currentStatus === false ? true : false }
            : student
        )
      );

      toast.success(
        currentStatus === false
          ? "Student Unblocked successfully"
          : "Student Blocked successfully"
      );
    } catch (error) {
      console.error("Error toggling student status:", error);
      toast.error("Error changing student status");
    }
  };

  const onLogout = () => {
    try {
      const response = axiosInstance.post("/admin/auth/logout");

      dispatch(logoutAdmin(admin));

      toast.success("Logged out successfully");

      navigate("/login");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar activeSection={"Students"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader heading="Student Management" />

        <main className="flex-1  overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white  rounded-xl min-h-[500px] shadow-lg p-8">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                  <button
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors  bg-[#ff6738] text-white`}
                  >
                    Students
                  </button>
                </div>
                <div className="relative  w-64">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Name
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Email
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 text-center">
                        Courses Enrolled
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedItems.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              crossorigin="anonymous"
                              referrerPolicy="no-referrer"
                              src={student.profileImg || defProfile}
                              alt={student.fullName}
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.userName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {student.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500">
                            {student.coursesEnrolled
                              ? student.coursesEnrolled.length
                              : 0}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => openModal(student)}
                              className="text-[#ff6738] hover:text-orange-700 transition-colors"
                              title="View Details"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleList(student._id, student.isActive)
                              }
                              className={`transition-colors text-white min-w-[70px]  p-1 rounded-sm ${
                                student.isActive === false
                                  ? "t bg-green-500 hover:bg-green-600"
                                  : " bg-red-500 hover:bg-red-600 "
                              }`}
                              title={
                                student.isActive === false
                                  ? "Unblock User"
                                  : "Block User"
                              }
                            >
                              {student.isActive === false ? "Unblock" : "Block"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Pagination
            className="flex items-center justify-center mt-3"
            totalData={filteredStudents.length}
            dataPerPage={dataPerPage}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
          />
        </main>
      </div>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Student Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <div className="text-gray-700 space-y-4">
              {selectedStudent.profileImg && (
                <div className="flex justify-center mb-4">
                  <img
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    src={selectedStudent.profileImg}
                    alt={`${selectedStudent.fullName}'s profile`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Full Name:</p>
                  <p>{selectedStudent.fullName}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Username:</p>
                  <p>{selectedStudent.userName}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Email:</p>
                  <p>{selectedStudent.email}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Phone:</p>
                  <p>{selectedStudent.phone || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Courses Enrolled:</p>
                <p>
                  {selectedStudent.activeCourses
                    ? selectedStudent.activeCourses.length
                    : 0}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Account Created:
                  </p>
                  <p>
                    {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
