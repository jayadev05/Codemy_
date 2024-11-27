"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  UserCheck,
  UserX,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import Sidebar from "./partials/sidebar";
import axios from "axios";

const TutorManagement = () => {
  const [activeTab, setActiveTab] = useState("tutors");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [tutors, setTutors] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  useEffect(() => {
    fetchTutorsAndApplications();
  }, []);

  const fetchTutorsAndApplications = async () => {
    try {
      setLoading(true);
      const [tutorsResponse, applicationsResponse] = await Promise.all([
        axios.get("http://localhost:3000/admin/get-tutors"), // Updated endpoint
        axios.get("http://localhost:3000/admin/instructor-applications"),
      ]);
      
      // Update to match the new response structure
      setTutors(tutorsResponse.data.tutors);
      setApplications(applicationsResponse.data.applications);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tutors and applications");
      setLoading(false);
      console.error(err);
    }
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

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const result = await axios.patch(
        `http://localhost:3000/admin/approve-tutor/${applicationId}`,
        {
          status: action, // 'approved' or 'rejected'
        }
      );

      // Update local state to reflect the change
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === applicationId ? { ...app, status: action } : app
        )
      );

      // Show appropriate alert
      alert(
        action === "approved"
          ? "Tutor Application Approved Successfully"
          : "Tutor Application Rejected"
      );
    } catch (error) {
      console.error(
        `Error ${
          action === "approved" ? "approving" : "rejecting"
        } tutor application:`,
        error
      );
      alert(
        `There was an error ${
          action === "approved" ? "approving" : "rejecting"
        } the Tutor`
      );
    }
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

  return (
    <div className="flex h-screen overflow-hidden bg-white">
    <Sidebar activeSection={"Instructors"} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-800">Tutor Management</h1>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
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
                      ? "bg-orange-500 text-white"
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-300"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {activeTab === "tutors" ? (
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-1 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((tutor) => (
                      <tr key={tutor._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tutor.fullName}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{tutor.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">2</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(tutor, "details")}
                              className="text-orange-500 hover:text-orange-700 transition-colors"
                              title="View Details"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {/* Implement unlist user logic */}}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Unlist User"
                            >
                              <UserX className="h-5 w-5" />
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
                {filteredItems.map((item) => (
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
                                onClick={() => openCertificateModal(credential)}
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
                        className="text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        <FileText className="h-6 w-6" />
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleApplicationAction(item._id, "approved")
                          }
                          className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.status !== "pending"}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleApplicationAction(item._id, "rejected")
                          }
                          className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.status !== "pending"}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>

    {isModalOpen && selectedApplication && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Tutor Details</h2>
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
          
          <div>
            <p className="font-semibold text-gray-900">Username:</p>
            <p>{selectedApplication.userName}</p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">Email:</p>
            <p>{selectedApplication.email}</p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">Status:</p>
            <span 
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedApplication.status === 'active'
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {selectedApplication.status}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">Job Title:</p>
          <p>{selectedApplication.jobTitle || 'Not specified'}</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">Bio:</p>
          <p>{selectedApplication.bio || 'No bio provided'}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-900">Total Revenue:</p>
            <p>${Number(selectedApplication.totalRevenue || 0).toFixed(2)}</p>
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">Account Created:</p>
            <p>{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {selectedApplication.credentials && 
         selectedApplication.credentials.some(credential => credential.description) && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">Experience/Description:</p>
            {selectedApplication.credentials
              .filter(credential => credential.description)
              .map((credential, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <p>{credential.description}</p>
                </div>
              ))
            }
          </div>
        )}
        
       
      </div>
    </div>
  </div>
)}
      {isCertificateModalOpen && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl h-[700px] w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Certificate Details
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
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Certificate Preview
                </h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <img
                    src={`http://localhost:3000/admin/certificates/${selectedCertificate._id}`}
                    alt="Certificate"
                    className="w-full h-[500px] object-contain rounded-lg"
                  />
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
