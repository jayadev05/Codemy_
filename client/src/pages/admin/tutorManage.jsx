"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  UserCheck,
  UserX,
  FileText,
  X,
} from "lucide-react";
import Sidebar from "./partials/sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import defProfile from "../../assets/user-profile.png";
import Pagination from "../../components/utils/Pagination";

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

  //pagination
  
  const [currentPage,setCurrentPage]=useState(1);
  const [dataPerPage]=useState(5);

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
      setLoading(true);
      const [tutorsResponse, applicationsResponse] = await Promise.all([
        axios.get("http://localhost:3000/admin/get-tutors"),
        axios.get("http://localhost:3000/admin/instructor-applications"),
      ]);


      // Ensure we have a clean list of tutors and applications
      setTutors(tutorsResponse.data.tutors || []);
      setApplications(applicationsResponse.data.applications || []);

      setLoading(false);

    } catch (err) {

      setError("Failed to fetch tutors and applications");

      setLoading(false);

      console.error(err);

      toast.error("Failed to load tutors and applications");
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      setLoading(true);
      const result = await axios.patch(
        `http://localhost:3000/admin/approve-tutor/${applicationId}`,
        {
          status: action,
        }
      );

      if (action === "approved") {
        // Ensure the new tutor is added to the tutors list
        if (result.data.tutor) {
          // Transform the application data to match tutor data structure
          const newTutor = {
            _id: result.data.tutor._id,
            fullName: result.data.tutor.fullName,
            email: result.data.tutor.email,
            userName: result.data.tutor.userName,
            status: result.data.tutor.status || "active",
            profileImg: result.data.tutor.profileImg,
            // Spread the rest of the tutor data
            ...result.data.tutor,
          };

          // Add the new tutor to the tutors list
          setTutors((prevTutors) => {
            // Check if tutor already exists to prevent duplicates
            const tutorExists = prevTutors.some(
              (tutor) => tutor._id === newTutor._id
            );
            return tutorExists
              ? prevTutors.map((tutor) =>
                  tutor._id === newTutor._id ? { ...tutor, ...newTutor } : tutor
                )
              : [...prevTutors, newTutor];
          });
        }

        // Remove the application from the list
        setApplications((prevApplications) =>
          prevApplications.filter((app) => app._id !== applicationId)
        );
        setLoading(false);
        toast.success("Tutor Application Approved Successfully");

        // Optionally, switch to the tutors tab to show the newly added tutor
        setActiveTab("tutors");
      } else {
        // If rejected, update the application status
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId ? { ...app, status: "rejected" } : app
          )
        );
        setLoading(false);
        toast.error("Tutor Application Rejected");
      }
    } catch (error) {
      console.error(
        `Error ${
          action === "approved" ? "approving" : "rejecting"
        } tutor application:`,
        error
      );

      toast.error(
        `There was an error ${
          action === "approved" ? "approving" : "rejecting"
        } the Tutor`
      );
    }
  };

  const handleToggleList = async (id, currentStatus) => {
    try {
      const endpoint = currentStatus === false
        ? `http://localhost:3000/admin/listtutor/${id}` 
        : `http://localhost:3000/admin/unlisttutor/${id}`;
  
      const result = await axios.put(endpoint);
      
      // Update the tutors state to reflect the new status
      setTutors(prevTutors => 
        prevTutors.map(tutor => 
          tutor._id === id 
            ? { ...tutor, isActive: currentStatus === false ? true : false } 
            : tutor
        )
      );
  
      toast.success(
        currentStatus === false
          ? "Tutor listed successfully" 
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

  const dummyUsers = [
    {
        "_id": "674c1459d07cf3c169773832",
        "fullName": "John Doe",
        "userName": "johndoe",
        "email": "johndoe@gmail.com",
        "phone": 1234567890,
        "password": "$2a$10$eK9rP8hXZP8lwJQZwVZvTuIvK1pz9jzH/2vAKybP3FyOx0FI9KtwC",
        "profileImg": "https://example.com/profile/johndoe.jpg",
        "jobTitle": "Software Engineer",
        "bio": "Passionate developer with a love for learning new technologies.",
        "totalRevenue": 12000.50,
        "credentials": ["BSc Computer Science", "AWS Certified Developer"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-12-01T07:46:33.879Z",
        "updatedAt": "2024-12-01T07:46:33.879Z"
    },
    {
        "_id": "674c1459d07cf3c169773833",
        "fullName": "Emma Rodriguez",
        "userName": "emmarodriguez",
        "email": "emma.rodriguez@yahoo.com",
        "phone": 9876543211,
        "password": "$2a$10$dZJ1vXlb1ePL3uXZNqlv6.2Rf8Bn6kSYH4D6H/bkUiEeq7r5sH6Ie",
        "profileImg": "https://example.com/profile/emmarodriguez.jpg",
        "jobTitle": "Product Manager",
        "bio": "Innovative product leader with a passion for user-centric design.",
        "totalRevenue": 18500.75,
        "credentials": ["MBA Technology Management", "Certified Scrum Master"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-25T14:30:22.456Z",
        "updatedAt": "2024-11-30T16:45:11.789Z"
    },
    {
        "_id": "674c1459d07cf3c169773834",
        "fullName": "Michael Chen",
        "userName": "michaelchen",
        "email": "michael.chen@outlook.com",
        "phone": 4561237891,
        "password": "$2a$10$f3Lv2KU.BWZ7PG6jMWTfuuyE2fDdL8H5xNvIhGQe82nXbg4qFNu2a",
        "profileImg": "https://example.com/profile/michaelchen.jpg",
        "jobTitle": "Machine Learning Engineer",
        "bio": "AI researcher dedicated to developing intelligent systems.",
        "totalRevenue": 22500.90,
        "credentials": ["PhD Machine Learning", "TensorFlow Certified"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-18T09:15:45.123Z",
        "updatedAt": "2024-11-29T11:22:33.456Z"
    },
    {
        "_id": "674c1459d07cf3c169773835",
        "fullName": "Sarah Williams",
        "userName": "sarahwilliams",
        "email": "sarah.williams@gmail.com",
        "phone": 7894561230,
        "password": "$2a$10$H7Ux9zQ1pL3nM6kF2vT8GuLpZ5XyR4F6T8hG9jK2sL1mN3vB5xC7a",
        "profileImg": "https://example.com/profile/sarahwilliams.jpg",
        "jobTitle": "UX Designer",
        "bio": "Creative designer transforming complex problems into elegant solutions.",
        "totalRevenue": 15600.25,
        "credentials": ["BA Design", "UX/UI Certification"],
        "isActive": true,
        "isVerified": false,
        "createdAt": "2024-11-22T16:45:30.789Z",
        "updatedAt": "2024-11-28T10:11:22.345Z"
    },
    {
        "_id": "674c1459d07cf3c169773836",
        "fullName": "David Kim",
        "userName": "davidkim",
        "email": "david.kim@protonmail.com",
        "phone": 3216549870,
        "password": "$2a$10$K9mL2pQ7rT5nB6xZ3vC8HuJkF4gH6jL9sM1dN7bV2cX5zA4yB6nD",
        "profileImg": "https://example.com/profile/davidkim.jpg",
        "jobTitle": "Cybersecurity Specialist",
        "bio": "Ethical hacker protecting digital infrastructure from emerging threats.",
        "totalRevenue": 19800.50,
        "credentials": ["MSc Cybersecurity", "CISSP Certified"],
        "isActive": false,
        "isVerified": true,
        "createdAt": "2024-11-15T11:20:33.456Z",
        "updatedAt": "2024-11-27T14:55:44.789Z"
    },
    {
        "_id": "674c1459d07cf3c169773837",
        "fullName": "Olivia Martinez",
        "userName": "oliviamartinez",
        "email": "olivia.martinez@icloud.com",
        "phone": 9012345678,
        "password": "$2a$10$P5nL3qR7tT6mB9xZ4vC9HuJkF5gH7jL0sM2dN8bV3cX6zA5yB7nD",
        "profileImg": "https://example.com/profile/oliviamartinez.jpg",
        "jobTitle": "Digital Marketing Strategist",
        "bio": "Growth hacker helping brands tell compelling digital stories.",
        "totalRevenue": 16750.35,
        "credentials": ["Digital Marketing Certificate", "Google Analytics Expert"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-20T13:45:22.123Z",
        "updatedAt": "2024-11-29T09:33:11.456Z"
    },
    {
        "_id": "674c1459d07cf3c169773838",
        "fullName": "Alex Johnson",
        "userName": "alexjohnson",
        "email": "alex.johnson@company.com",
        "phone": 5432167890,
        "password": "$2a$10$Q6mM4rS8uU7nC0xY5wD0IvKlF6hJ8kL1sN9dM2bV4cX7zB6yC8nE",
        "profileImg": "https://example.com/profile/alexjohnson.jpg",
        "jobTitle": "Cloud Solutions Architect",
        "bio": "Designing scalable cloud infrastructures for enterprise-level solutions.",
        "totalRevenue": 24500.75,
        "credentials": ["AWS Solutions Architect", "Azure Expert"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-17T10:30:45.678Z",
        "updatedAt": "2024-11-28T15:22:33.890Z"
    },
    {
        "_id": "674c1459d07cf3c169773839",
        "fullName": "Rachel Thompson",
        "userName": "rachelthompson",
        "email": "rachel.thompson@startup.io",
        "phone": 6543210987,
        "password": "$2a$10$R7nN5sT9vV8mD1xY6wE1JvLmG7hK9kM2sP0dN3bW5cY8zC7yD9nF",
        "profileImg": "https://example.com/profile/rachelthompson.jpg",
        "jobTitle": "Blockchain Developer",
        "bio": "Innovating decentralized solutions for a more transparent digital economy.",
        "totalRevenue": 20300.50,
        "credentials": ["Blockchain Certification", "Smart Contract Expert"],
        "isActive": false,
        "isVerified": false,
        "createdAt": "2024-11-16T14:55:11.234Z",
        "updatedAt": "2024-11-26T12:44:22.567Z"
    },
    {
        "_id": "674c1459d07cf3c169773840",
        "fullName": "Carlos Fernandez",
        "userName": "carlosfernandez",
        "email": "carlos.fernandez@tech.com",
        "phone": 2109876543,
        "password": "$2a$10$S8oO6uT0wW9nE2xZ7xF2KwMnH8hL1kJ3sQ4dM5bV6cY9zD8yE0nG",
        "profileImg": "https://example.com/profile/carlosfernandez.jpg",
        "jobTitle": "AI Research Scientist",
        "bio": "Pushing the boundaries of artificial intelligence and machine learning.",
        "totalRevenue": 26750.90,
        "credentials": ["PhD AI", "Research Publication Award"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-19T08:20:33.456Z",
        "updatedAt": "2024-11-30T13:11:44.789Z"
    },
    {
        "_id": "674c1459d07cf3c169773841",
        "fullName": "Lisa Wong",
        "userName": "lisawong",
        "email": "lisa.wong@research.edu",
        "phone": 8765432109,
        "password": "$2a$10$T9pP7vU1xX0nF3xY8yG3LxNmI9hM2kJ4sQ5dN6bW7cZ0zE9yF1nH",
        "profileImg": "https://example.com/profile/lisawong.jpg",
        "jobTitle": "Quantum Computing Researcher",
        "bio": "Exploring quantum algorithms to revolutionize computational capabilities.",
        "totalRevenue": 21600.25,
        "credentials": ["PhD Quantum Physics", "Quantum Computing Specialist"],
        "isActive": true,
        "isVerified": false,
        "createdAt": "2024-11-21T15:33:44.567Z",
        "updatedAt": "2024-11-29T11:55:22.234Z"
    },
    {
        "_id": "674c1459d07cf3c169773842",
        "fullName": "Raj Patel",
        "userName": "rajpatel",
        "email": "raj.patel@fintech.io",
        "phone": 9870123456,
        "password": "$2a$10$U0qQ8wV2yY1nG4xZ9zH4MwNmJ0hN3kL5sR6dM7bV8cW1zF0yG2nI",
        "profileImg": "https://example.com/profile/rajpatel.jpg",
        "jobTitle": "Fintech Solutions Architect",
        "bio": "Creating innovative financial technologies that transform banking experiences.",
        "totalRevenue": 23400.75,
        "credentials": ["Fintech Innovation Award", "Blockchain in Finance Certification"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-23T12:45:55.678Z",
        "updatedAt": "2024-11-30T10:22:33.901Z"
    },
    {
        "_id": "674c1459d07cf3c169773843",
        "fullName": "Emily Park",
        "userName": "emilypark",
        "email": "emily.park@renewable.com",
        "phone": 7654321098,
        "password": "$2a$10$V1rR9xW3zZ2nH5xY0zI5NxOmK1hP4kM6sT7dN8bW9cX2zG1yH3nJ",
        "profileImg": "https://example.com/profile/emilypark.jpg",
        "jobTitle": "Renewable Energy Engineer",
        "bio": "Developing sustainable energy solutions for a greener future.",
        "totalRevenue": 17850.50,
        "credentials": ["MSc Sustainable Energy", "Green Technology Expert"],
        "isActive": false,
        "isVerified": true,
        "createdAt": "2024-11-24T16:11:22.345Z",
        "updatedAt": "2024-11-28T14:33:44.567Z"
    },
    {
        "_id": "674c1459d07cf3c169773844",
        "fullName": "Tom Baker",
        "userName": "tombaker",
        "email": "tom.baker@robotics.tech",
        "phone": 6543210976,
        "password": "$2a$10$W2sS0yX4aA3nI6xZ1zJ6OyPmL2hQ5kN7sM8dR9bV0cW3zH2yI4nK",
        "profileImg": "https://example.com/profile/tombaker.jpg",
        "jobTitle": "Robotics and Automation Specialist",
        "bio": "Engineering intelligent robotic systems that enhance human capabilities.",
        "totalRevenue": 25600.25,
        "credentials": ["Robotics Engineering PhD", "AI in Robotics Certification"],
        "isActive": true,
        "isVerified": false,
        "createdAt": "2024-11-22T09:55:33.789Z",
        "updatedAt": "2024-11-29T13:44:11.234Z"
    },
    {
        "_id": "674c1459d07cf3c169773845",
        "fullName": "Anna Novak",
        "userName": "annanovak",
        "email": "anna.novak@biotech.com",
        "phone": 8901234567,
        "password": "$2a$10$X3tT1yY5bB4nJ7xZ2zK7PzQmM3hR6kL9sN0dW1bV5cX4zI3yJ5nL",
        "profileImg": "https://example.com/profile/annanovak.jpg",
        "jobTitle": "Biotechnology Researcher",
        "bio": "Pioneering genetic research to solve complex medical challenges.",
        "totalRevenue": 22750.90,
        "credentials": ["PhD Biotechnology", "Genetic Research Award"],
        "isActive": true,
        "isVerified": true,
        "createdAt": "2024-11-20T11:33:44.456Z",
        "updatedAt": "2024-11-30T12:55:22.789Z"
    },
  ]

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

  const paginatedItems = paginateData(filteredItems);

 

  return (
    <div className="flex h-screen overflow-hidden bg-white">
     
      <Sidebar activeSection={"Instructors"} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-800">Tutor Management</h1>
        </header>
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
                              crossorigin="anonymous"
                              referrerpolicy="no-referrer"
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
                            {tutor.phone || 'N/A'}
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
                              className="text-orange-500 hover:text-orange-700 transition-colors"
                              title="View Details"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleList(tutor._id, tutor.isActive)
                              }
                              className={`transition-colors text-white min-w-[70px]  p-2 rounded-sm ${
                                tutor.isActive === false
                                  ? "t bg-green-400 hover:bg-green-600"
                                  : " bg-red-500 hover:bg-red-600 "
                              }`}
                              title={
                                tutor.isActive === false
                                  ? "List User"
                                  : "Unlist User"
                              }
                            >
                              {tutor.isActive === false ? (
                                "List"
                              ) : (
                               "Unlist"
                              )}
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
            <Pagination className="mt-3 justify-center flex gap-3"  totalData={filteredItems.length} dataPerPage={dataPerPage} currentPage={currentPage} setCurrentPage={handlePageChange}/>

          </div>

        </main>
      </div>

      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Tutor Details
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
                      selectedApplication.status === "active"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Job Title:</p>
                <p>{selectedApplication.jobTitle || "Not specified"}</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Bio:</p>
                <p>{selectedApplication.bio || "No bio provided"}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Total Revenue:</p>
                  <p>
                    ${Number(selectedApplication.totalRevenue || 0).toFixed(2)}
                  </p>
                </div>

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

              {selectedApplication.credentials &&
                selectedApplication.credentials.some(
                  (credential) => credential.description
                ) && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      Experience/Description:
                    </p>
                    {selectedApplication.credentials
                      .filter((credential) => credential.description)
                      .map((credential, index) => (
                        <div key={index} className="bg-gray-100 p-4 rounded-lg">
                          <p>{credential.description}</p>
                        </div>
                      ))}
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
