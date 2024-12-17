"use client"

import React, { useEffect, useState } from 'react'
import { Check, X, Send, AlertCircle, Bell } from 'lucide-react'
import SecondaryFooter from '../../components/layout/user/SecondaryFooter'
import Header from '../../components/layout/Header'
import MainHeader from '../../components/layout/user/MainHeader'
import Sidebar from '../../components/layout/admin/sidebar'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAdmin, selectAdmin } from '../../store/slices/adminSlice'
import defProfile from '../../assets/user-profile.png'
import axios from 'axios'
import { useNavigate } from 'react-router'



export default function ReportManagement () {

  const admin=useSelector(selectAdmin);
  const dispatch=useDispatch();
  const navigate=useNavigate()

  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [actionTaken, setActionTaken] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log(reports)

  useEffect(()=>{

    const fetchReports=async()=>{
      try {

        const response=await axios.get('http://localhost:3000/admin/get-reports');

        setReports(response.data.reports)

      } catch (error) {
        console.log("Error in report fetching",error)
      }
    }
    fetchReports();

  },[])


  const handleResolve = (id) => {
    setReports(reports.filter(report => report._id !== id))
  }

  const handleReject = (id) => {
    setReports(reports.filter(report => report._id !== id))
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
    console.log(`Action taken for report ${selectedReport.id}: ${actionTaken}`)
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

  return (
    <>
     <div className="min-h-screen bg-gray-100 flex">
      <Sidebar activeSection="Reports"/>
      <div className='flex flex-col overflow-hidden flex-1'>

      <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
          <div>
            <h1 className="text-xl font-semibold">Report Management</h1>
            
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
        
      <main className='flex-1  overflow-x-hidden overflow-y-auto bg-gray-100 p-8'>

    
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Open Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No open reports</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report._id} className="bg-gray-50 rounded-md p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Reported by: {report.reportedBy.fullName}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResolve(report._id)}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleReject(report._id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => openModal(report)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
    
      </main>

      </div>
    
     
      
      

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Send Action to Reporter</h2>
            <p className="text-sm text-gray-600 mb-4">
              Report: {selectedReport.title} by {selectedReport.reporter}
            </p>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full h-32 p-2 border rounded-md mb-4"
              placeholder="Describe the action taken..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendAction}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <SecondaryFooter/>
    </>
   
  )
}

