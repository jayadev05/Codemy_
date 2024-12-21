import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo_cap.png'
import UnauthorizedImg from '../../assets/404.png'
import Header from '../../components/layout/Header'

function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <Header />

      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className=" mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-red-500 flex items-center gap-2">
              <img src={logo} alt="" />
              <h3 className='text-black '>Codemy</h3>
            </a>
            <div className="relative">
              <select className="appearance-none bg-transparent pr-8 focus:outline-none">
                <option>Browse</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative flex-1 max-w-2xl">
              <input
                type="search"
                placeholder="What do you want learn..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 hover:text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="p-2 hover:text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">

        <div className="md:w-1/2">
            <img 
              src={UnauthorizedImg}
              alt="401 Unauthorized Illustration" 
              className="max-w-full h-auto"
            />
          </div>
          <div className="md:w-1/3 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-7xl font-light text-gray-600 mb-4">Error 403</h1>
            <h2 className="text-3xl font-bold mb-4">Page Forbidden</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Oops! It seems you don't have permission to access this page. Please check your credentials or contact the administrator for assistance.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-[#ff6738] text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors me-5"
            >
              Go Back
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#ff6738] text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Go to Login Page
            </button>
          </div>
       
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div>© 2024 - Designed by Templatecookie. All rights reserved</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">FAQs</a>
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms & Condition</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default UnauthorizedPage

