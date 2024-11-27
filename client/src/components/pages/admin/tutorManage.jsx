"use client"

import React, { useState, useEffect } from 'react'
import { Search, Eye, UserCheck, UserX, FileText, X, ChevronDown } from 'lucide-react'
import Sidebar from './partials/sidebar'
import axios from 'axios'

const TutorManagement = () => {
  const [activeTab, setActiveTab] = useState('requests')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('details')
  const [searchTerm, setSearchTerm] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInstructorApplications()
  }, [])

  const fetchInstructorApplications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:3000/admin/instructor-applications')
      setApplications(response.data.applications)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch instructor applications')
      setLoading(false)
      console.error(err)
    }
  }

  const openModal = (application, content) => {
    setSelectedApplication(application)
    setModalContent(content)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedApplication(null)
  }

  const handleApprove = async (applicationId) => {
    try {
      // Implement your approval logic here
      console.log(`Approving application with id ${applicationId}`)
      fetchInstructorApplications()
    } catch (err) {
      console.error('Failed to approve application', err)
    }
  }

  const filteredApplications = applications.filter(application =>
    application.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className='flex h-screen overflow-hidden justify-center items-center bg-[rgb(29,32,38)]'>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[rgb(255,101,54)]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-screen overflow-hidden justify-center items-center bg-[rgb(29,32,38)] text-red-500'>
        {error}
      </div>
    )
  }

  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar activeSection={'Instructors'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[rgb(39,42,48)] border-b border-gray-700 p-4">
          <h1 className="text-2xl font-bold text-white">Tutor Management</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[rgb(29,32,38)]">
          <div className="container mx-auto px-6 py-8">
            <div className="bg-[rgb(39,42,48)] rounded-lg shadow-xl p-6">
              <div>
                {/* Search input remains the same */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredApplications.map((application) => (
                    <div 
                      key={application._id} 
                      className="bg-[rgb(29,32,38)] p-4 rounded-lg flex flex-col justify-between border border-gray-700"
                    >
                      <div>
                        <h3 className="font-semibold text-white">{application.fullName}</h3>
                        <p className="text-sm text-gray-400">{application.email}</p>
                        <p className="text-sm text-gray-400 mt-2">Phone: {application.phone}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          <strong>Status:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            application.status === 'pending' 
                              ? 'bg-yellow-500 text-yellow-900' 
                              : application.status === 'approved'
                              ? 'bg-green-500 text-green-900'
                              : 'bg-red-500 text-red-900'
                          }`}>
                            {application.status}
                          </span>
                        </p>
                        {/* New section to display credentials/certificates */}
                        {application.credentials && application.credentials.length > 0 && (
                          <div className="mt-2">
                            <strong className="text-sm text-gray-300">Credentials:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {application.credentials.map((credential, index) => (
                                <span 
                                  key={index}
                                  className="bg-[rgb(255,101,54)] text-white text-xs px-2 py-1 rounded-full"
                                >
                                  {credential}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <button
                          onClick={() => openModal(application, 'details')}
                          className="text-[rgb(255,101,54)] hover:text-[rgb(235,81,34)] transition-colors"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleApprove(application._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          disabled={application.status !== 'pending'}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Rest of the component remains the same */}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for detailed view - also updated to show credentials */}
      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[rgb(39,42,48)] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Application Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="text-white">
              <p className="mb-2"><strong className="font-medium">Name:</strong> {selectedApplication.fullName}</p>
              <p className="mb-2"><strong className="font-medium">Email:</strong> {selectedApplication.email}</p>
              <p className="mb-2"><strong className="font-medium">Phone:</strong> {selectedApplication.phone}</p>
              <p className="mb-2"><strong className="font-medium">Experience:</strong> {selectedApplication.experience}</p>
              <p className="mb-2">
                <strong className="font-medium">Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedApplication.status === 'pending' 
                    ? 'bg-yellow-500 text-yellow-900' 
                    : selectedApplication.status === 'approved'
                    ? 'bg-green-500 text-green-900'
                    : 'bg-red-500 text-red-900'
                }`}>
                  {selectedApplication.status}
                </span>
              </p>
              
              {/* New section to show credentials in modal */}
              {selectedApplication.credentials && selectedApplication.credentials.length > 0 && (
                <div className="mt-4">
                  <strong className="font-medium block mb-2">Credentials:</strong>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.credentials.map((credential, index) => (
                      <span 
                        key={index} 
                        className="bg-[rgb(255,101,54)] text-white text-xs px-2 py-1 rounded-full"
                      >
                        {credential}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.reviewNotes && (
                <p className="mt-4">
                  <strong className="font-medium">Review Notes:</strong> 
                  {selectedApplication.reviewNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorManagement