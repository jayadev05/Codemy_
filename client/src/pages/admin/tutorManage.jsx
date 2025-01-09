"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, FileText, X, Bell, Loader2 } from "lucide-react";

import axios from "axios";
import { toast } from "react-hot-toast";
import defProfile from "../../assets/user-profile.png";
import Pagination from "../../components/utils/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser } from "../../store/slices/userSlice";
import CertificateViewer from "../../components/utils/CertificateViewer";
import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import { useNavigate } from "react-router";
import Sidebar from "../../components/layout/admin/sidebar";
import axiosInstance from "../..//config/axiosConfig";
import AdminHeader from "@/components/layout/admin/AdminHeader";

const TutorManagement = () => {
  const user = useSelector(selectUser);
  const admin = useSelector(selectAdmin);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tutors");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [tutors, setTutors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  //pagination

  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(5);

  // Pagination logic for both tutors and applications

  const paginateData = (data) => {
    const startIndex = currentPage * dataPerPage - dataPerPage;
    const endIndex = startIndex + dataPerPage;
    return data.slice(startIndex, endIndex);
  };

  useEffect(() => {
    fetchTutorsAndApplications();
  }, []);

  const fetchTutorsAndApplications = async () => {
    try {
      const [tutorsResponse, applicationsResponse] = await Promise.all([
        axiosInstance.get("http://localhost:3000/admin/tutors"),
        axiosInstance.get(
          "http://localhost:3000/admin/instructor-applications"
        ),
      ]);

      // Ensure we have a clean list of tutors and applications
      setTutors(tutorsResponse.data.tutors || []);
      setApplications(applicationsResponse.data.applications || []);
    } catch (err) {
      setError("Failed to fetch tutors and applications");

      console.error(err);

      toast.error("Failed to load tutors and applications");
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      setLoading(action);

      // Update application status
      const response = await axiosInstance.patch(
        `/admin/instructor-application/${applicationId}/approve`,
        { status: action }
      );

      // Review application
      const result = await axiosInstance.put(
        `/admin/instructor-applications/${applicationId}/review`,
        { status: response.data.status }
      );

      if (action === "approved" && result.data.tutor) {
        // Update tutors list
        setTutors((prevTutors) => {
          const newTutor = result.data.tutor;
          return prevTutors.find((t) => t._id === newTutor._id)
            ? prevTutors.map((t) => (t._id === newTutor._id ? newTutor : t))
            : [...prevTutors, newTutor];
        });

        setApplications((prev) =>
          prev.filter((app) => app._id !== applicationId)
        );
        dispatch(logoutUser(user));
        setActiveTab("tutors");
        toast.success("Tutor Application Approved Successfully");
      } else {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status: "rejected" } : app
          )
        );
        toast.error("Tutor Application Rejected");
      }
    } catch (error) {
      console.error("Error processing application:", error);
      toast.error(`Failed to ${action} the Tutor`);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleList = async (id, currentStatus) => {
    try {
      const endpoint =
        currentStatus === false
          ? `http://localhost:3000/admin/tutor/${id}/list`
          : `http://localhost:3000/admin/tutor/${id}/unlist`;

      const result = await axiosInstance.put(endpoint);

      // Update the tutors state to reflect the new status
      setTutors((prevTutors) =>
        prevTutors.map((tutor) =>
          tutor._id === id
            ? { ...tutor, isActive: currentStatus === false ? true : false }
            : tutor
        )
      );

      toast.success(
        currentStatus === false
          ? "Tutor Unblocked successfully"
          : "Tutor blocked successfully"
      );
    } catch (error) {
      console.error("Error toggling tutor status:", error);
      toast.error("Error changing tutor status");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Conversion function
  const convertDecimalToNumber = (decimalObj) => {
    return decimalObj && decimalObj.$numberDecimal
      ? parseFloat(decimalObj.$numberDecimal)
      : decimalObj;
  };

  const openModal = (item, content) => {
    setSelectedApplication(item);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const openCertificateModal = (certificate) => {
    setSelectedCertificate(certificate);
    setIsCertificateModalOpen(true);
  };

  const closeCertificateModal = () => {
    setIsCertificateModalOpen(false);
    setSelectedCertificate(null);
  };

  const filteredItems =
    activeTab === "tutors"
      ? tutors.filter(
          (tutor) =>
            tutor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tutor.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : applications.filter(
          (application) =>
            application.fullName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            application.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const paginatedItems = paginateData(filteredItems);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="sticky top-0 h-screen">
        <Sidebar activeSection={"Instructors"} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader heading="Tutor Management" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg lg:min-h-[550px] p-8">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("tutors")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "tutors"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Tutors
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "applications"
                        ? "bg-[#ff6738] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Applications
                  </button>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {activeTab === "tutors" ? (
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
                          Courses
                        </th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedItems.map((tutor) => (
                        <tr
                          key={tutor._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                src={tutor.profileImg || defProfile}
                                alt={tutor.fullName}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {tutor.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {tutor.userName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {tutor.email}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {tutor.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="text-sm text-gray-500">
                              {tutor.courses ? tutor.courses.length : 0}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => openModal(tutor, "details")}
                                className="text-[#ff6738] hover:text-orange-700 transition-colors"
                                title="View Details"
                              >
                                <FileText className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleList(tutor._id, tutor.isActive)
                                }
                                className={`transition-colors text-white min-w-[70px]  p-1 rounded-sm ${
                                  tutor.isActive === false
                                    ? "t bg-green-500 hover:bg-green-600"
                                    : " bg-red-500 hover:bg-red-600 "
                                }`}
                                title={
                                  tutor.isActive === false
                                    ? "Unblock User"
                                    : "Block User"
                                }
                              >
                                {tutor.isActive === false ? "Unblock" : "Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white p-6 rounded-lg flex flex-col justify-between border border-gray-200 hover:border-orange-500 transition-all duration-300 shadow-md"
                    >
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">
                          {item.fullName}
                        </h3>
                        <p className="text-gray-600 mb-1">{item.email}</p>

                        <p className="text-gray-600 mb-4">
                          <strong>Status:</strong>
                          <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "pending"
                                ? "bg-yellow-200 text-yellow-800"
                                : item.status === "approved"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </p>

                        {item.credentials && item.credentials.length > 0 ? (
                          <div className="space-y-2">
                            {item.credentials.map((credential) => (
                              <div
                                key={credential._id}
                                className="p-3 rounded-md"
                              >
                                <button
                                  onClick={() =>
                                    openCertificateModal(credential)
                                  }
                                  className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
                                >
                                  View Certificate
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No credentials available
                          </p>
                        )}
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                        <button
                          onClick={() => openModal(item, "details")}
                          className="text-[#ff6738] hover:text-orange-700 transition-colors"
                        >
                          <FileText className="h-6 w-6" />
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleApplicationAction(item._id, "approved")
                            }
                            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={
                              item.status !== "pending" ||
                              loading === "approved"
                            }
                          >
                            {loading === "approved" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleApplicationAction(item._id, "rejected")
                            }
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={
                              item.status !== "pending" ||
                              loading === "rejected"
                            }
                          >
                            {loading === "rejected" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Pagination
                className="flex items-center justify-between mt-3"
                totalData={filteredItems.length}
                dataPerPage={dataPerPage}
                currentPage={currentPage}
                setCurrentPage={handlePageChange}
              />
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {activeTab === "tutors"
                  ? "Tutor Details"
                  : "Application Details"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <div className="text-gray-700 space-y-4">
              {selectedApplication.profileImg && (
                <div className="flex justify-center mb-4">
                  <img
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    src={selectedApplication.profileImg}
                    alt={`${selectedApplication.fullName}'s profile`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Full Name:</p>
                  <p>{selectedApplication.fullName}</p>
                </div>

                {selectedApplication?.userName ? (
                  <div>
                    <p className="font-semibold text-gray-900">Username:</p>
                    <p>
                      {convertDecimalToNumber(selectedApplication?.userName)}
                    </p>
                  </div>
                ) : (
                  ""
                )}

                {selectedApplication?.field ? (
                  <div>
                    <p className="font-semibold text-gray-900">Field:</p>
                    <p>{selectedApplication?.field}</p>
                  </div>
                ) : (
                  ""
                )}

                <div>
                  <p className="font-semibold text-gray-900">Email:</p>
                  <p>{selectedApplication.email}</p>
                </div>

                {selectedApplication?.experience ? (
                  <div>
                    <p className="font-semibold text-gray-900">Experience:</p>
                    <p>{selectedApplication?.experience}</p>
                  </div>
                ) : (
                  ""
                )}

                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">Job Title:</p>
                  <p>{selectedApplication.jobTitle || "Not specified"}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Status:</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedApplication.status === "active" ||
                      selectedApplication.isActive === true
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Bio:</p>
                <p>{selectedApplication.bio || "No bio provided"}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedApplication?.totalRevenue ? (
                  <div>
                    <p className="font-semibold text-gray-900">
                      Total Revenue:
                    </p>
                    <p>
                      {convertDecimalToNumber(
                        selectedApplication?.totalRevenue
                      )}
                    </p>
                  </div>
                ) : (
                  ""
                )}

                <div>
                  <p className="font-semibold text-gray-900">
                    Account Created:
                  </p>
                  <p>
                    {new Date(
                      selectedApplication.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isCertificateModalOpen && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl  w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Certificate Preview
              </h2>
              <button
                onClick={closeCertificateModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
            <div className="text-gray-700 space-y-4">
              <div>
                <div className="p-4 rounded-lg">
                  <CertificateViewer certificate={selectedCertificate} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorManagement;
