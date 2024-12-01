"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./partials/sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import defProfile from "../../../assets/user-profile.png";
import {
  Search,
  UserCheck,
  UserX,
  FileText,
  X,

} from "lucide-react";

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/admin/get-students");
      console.log("response data length ",response.data.students.length);
      setStudents(response.data.students || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch students");
      setLoading(false);
      console.error(err);
      toast.error("Failed to load students");
    }
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
      const endpoint = currentStatus === false
        ? `http://localhost:3000/admin/listuser/${id}` 
        : `http://localhost:3000/admin/unlistuser/${id}`;
  
      const result = await axios.put(endpoint);
      
      // Update the tutors state to reflect the new status
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student._id === id 
            ? { ...student, isActive: currentStatus === false ? true : false } 
            : tutor
        )
      );
  
      toast.success(
        currentStatus === false
          ? "Student Listed successfully" 
          : "Student Unlisted successfully"
      );
    } catch (error) {
      console.error("Error toggling student status:", error);
      toast.error("Error changing student status");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <ToastContainer />
      <Sidebar activeSection={"Students"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6 flex justify-end">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300"
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
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
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
                            {student.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="text-sm text-gray-500">
                            {student.coursesEnrolled ? student.coursesEnrolled.length : 0}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => openModal(student)}
                              className="text-orange-500 hover:text-orange-700 transition-colors"
                              title="View Details"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleList(student._id, student.isActive)
                              }
                              className={`transition-colors ${
                                student.isActive === false
                                  ? "text-green-500 hover:text-green-700"
                                  : "text-red-500 hover:text-red-700"
                              }`}
                              title={
                                student.isActive === false
                                  ? "List User"
                                  : "Unlist User"
                              }
                            >
                              {student.isActive === false ? (
                                <UserCheck className="h-5 w-5" />
                              ) : (
                                <UserX className="h-5 w-5" />
                              )}
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
                  <p>{selectedStudent.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Courses Enrolled:</p>
                <p>{selectedStudent.coursesEnrolled ? selectedStudent.coursesEnrolled.length : 0}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Account Created:</p>
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

