"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Send,
  AlertCircle,
  Bell,
  LogOut,
  User,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import { useNavigate } from "react-router";
import Sidebar from "../../components/layout/admin/sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";
import Pagination from "../../components/utils/Pagination";
import axiosInstance from "../..//config/axiosConfig";
import { socketService } from "@/services/socket";
import AdminHeader from "@/components/layout/admin/AdminHeader";

const StatusBadge = ({ status }) => {
  const styles = {
    open: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    "in-progress": "bg-blue-100 text-blue-800",
  };

  const icons = {
    open: <AlertCircle className="w-4 h-4" />,
    resolved: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
    "in-progress": <Clock className="w-4 h-4" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        styles[status.toLowerCase()]
      }`}
    >
      {icons[status.toLowerCase()]}
      {status}
    </span>
  );
};

export default function ReportManagement() {
  const admin = useSelector(selectAdmin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionTaken, setActionTaken] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState(reports);

  const [currentPage, setCurrentPage] = useState(1);
  const dataPerPage = 2;

  const [status, setStatus] = useState("");

  const paginateData = (data) => {
    const startIndex = currentPage * dataPerPage - dataPerPage;
    const endIndex = startIndex + dataPerPage;
    return data.slice(startIndex, endIndex);
  };

  //fetching reports

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      if (!admin?._id) return;

      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) return;

      // Socket connection
      socketService.connect(token, refreshToken);

      return () => {
        socketService.disconnect();
      };
    };

    initializeChat();
  }, [admin?._id]);

  useEffect(() => {
  

    const results = reports.filter(
      (report) =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportedBy.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredReports(results);
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get("/admin/reports");
      setReports(response.data.repopulatedReports);
    } catch (error) {
      console.log("Error fetching reports", error);
    }
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setActionTaken("");
    setIsModalOpen(false);
  };

  const sendAction = async (userId) => {
    try {
      const response = await axiosInstance.post("/admin/notifications", {
        userId,
        actionTaken,
      });

      if (response.status === 200) {
        toast.success("Updated the status and Notified the user sucessfully!");
        fetchReports();
      }
    } catch (error) {
      console.log("Error sending actions", error);
    } finally {
      closeModal();
    }
  };

  const handleReport = async (reportId, userId) => {
  

    try {
      const response = await axiosInstance.put("/admin/reports", {
        reportId,
        status,
      });

      if (response.status === 200) {
        try {
          sendAction(userId);
        } catch (error) {
          console.log("Error sending notification", error);
        }
      }
    } catch (error) {
      console.log("Error handling report status", error);
    }
  };

  const openReportsCount = reports.filter(
    (report) => report.status === "Open"
  ).length;

  const paginatedReports = paginateData(filteredReports);

  return (
    <>
      <div className="min-h-screen flex ">
        <Sidebar activeSection="Reports" />

        <div className="flex flex-1 flex-col">
          <AdminHeader heading="Report Management" />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* Search and Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <h2 className="font-bold text-lg text-gray-900">
                Open Reports {`(${openReportsCount})`}
              </h2>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {paginatedReports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 py-4 px-6 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {report.title.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reported By : {report.reportedBy?.fullName}{" "}
                        {report.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        Issue Type : {report.type} {report.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        Report Target :{" "}
                        {report.targetId?.title || report.targetId?.fullName}{" "}
                        {report.date}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <p className="text-gray-700 mb-4">{report.description}</p>

                  {report.status === "Open" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setStatus("Resolved");
                          openModal(report);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          setStatus("Rejected");
                          openModal(report);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
          <Pagination
            className="mb-8 flex justify-center"
            totalData={filteredReports.length}
            dataPerPage={dataPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Send Action to Reporter
              </h2>
              <p className="text-sm text-black mb-4">
                Report: {selectedReport.title} by{" "}
                {selectedReport.reportedBy?.fullName}
              </p>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full h-32 p-2 border border-orange-300 rounded-md mb-4 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe the action taken..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleReport(
                      selectedReport._id,
                      selectedReport.reportedBy._id
                    )
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
