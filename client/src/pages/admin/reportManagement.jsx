'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Send, AlertCircle, Bell, LogOut, User, Settings, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAdmin } from '../../store/slices/adminSlice'
import { useNavigate } from 'react-router'
import Sidebar from '../../components/layout/admin/sidebar'
import axios from 'axios'

export default function ReportManagement() {


  const admin = useSelector(selectAdmin);
  const navigate=useNavigate()
  const dispatch=useDispatch()

  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionTaken, setActionTaken] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReports, setFilteredReports] = useState(reports)


useEffect(()=>{

const fetchReports=async()=>{
  try {

    const response=await axios.get('http://localhost:3000/admin/get-reports');
    setReports(response.data.reports);

  } catch (error) {
    console.log("Error fetching reports",error);
  }
}

fetchReports();



},[])

  useEffect(() => {
    const results = reports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredReports(results)
  }, [searchTerm, reports])

  const handleStatusChange = (id, newStatus) => {
    setReports(reports.map(report => 
      report._id === id ? { ...report, status: newStatus } : report
    ))
  }

  const openModal = (report) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedReport(null)
    setActionTaken('')
    setIsModalOpen(false)
  }

  const sendAction = () => {
    console.log(`Action taken for report ${selectedReport._id}: ${actionTaken}`)
    closeModal()
  }

  const onLogout=()=>{
    try {
      const response=axios.post("http://localhost:3000/admin/logout");

      dispatch(logoutAdmin(admin));

      toast.success("Logged out successfully");
      
      navigate('/login');

      
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user")
    }
  }

  const openReportsCount= reports.filter((report)=>report.status==="Open").length

  return (
    <>
    <div className="min-h-screen flex ">

      <Sidebar activeSection='Reports'/>

      <div className='flex flex-1 flex-col'>
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
               <div>
                 <h1 className="text-xl font-semibold">Reports Management</h1>
                 
               </div>
               <div className="flex items-center gap-4">
                 
                 <button className="p-2 rounded-full hover:bg-gray-100">
                   <Bell className="h-5 w-5" />
                 </button>
                
                {/* Dropdown container */}
                <div className="relative group">
                     <img
                       referrerPolicy="no-referrer"
                       crossOrigin="anonymous"
                       className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                       src={admin?.profileImg || defProfile}
                       alt=""
                     />
     
                     {/* Dropdown menu */}
                     <div className="absolute right-0 z-10  w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                       <div className="px-4 py-2 border-b">
                         <p className="text-sm font-medium text-gray-900">
                           {admin?.userName}
                         </p>
                         <p className="text-sm text-gray-500 truncate">
                           {admin?.email}
                         </p>
                       </div>
     
                       <a
                       
                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                       >
                         Profile
                       </a>
                       <a
                     
                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                       >
                         Settings
                       </a>
                       <button
                       onClick={onLogout}
                         className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                       >
                         Logout
                       </button>
                     </div>
                   </div>
               </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold mb-4 sm:mb-0 text-black">Open Reports({openReportsCount})</h2>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-orange-400" />
            </div>
          </div>
          {filteredReports.length === 0 ? (
            <p className="text-orange-600">No reports found</p>
          ) : (
            <ul className="space-y-4">
              {filteredReports.map((report) => (
                <li key={report.id} className="bg-orange-50 rounded-lg shadow-md p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-black">{report.title}</h3>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report._id, e.target.value)}
                      className="ml-2 block pl-3 pr-10 py-2 text-base border-orange-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                      <option value="in-Progress">In Progress</option>

                    </select>
                  </div>
                  <p className="text-gray-800 mb-4">{report.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-orange-600">Reported by: {report?.reportedBy?.fullName}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(report._id, 'resolved')}
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                        aria-label="Resolve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleStatusChange(report._id, 'rejected')}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                        aria-label="Reject"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => openModal(report)}
                        className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                        aria-label="Send Action"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      </div>

     

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-orange-800">Send Action to Reporter</h2>
            <p className="text-sm text-orange-600 mb-4">
              Report: {selectedReport.title} by {selectedReport.reportedBy}
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
                onClick={sendAction}
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
    
  )
}

