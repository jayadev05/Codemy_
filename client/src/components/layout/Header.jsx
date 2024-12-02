import React, { useState } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";

function Header({ showModal,isLoggedIn }) {
 

  return (
    <header className="bg-[#1d2026] text-[#8c94a3]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
          <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium hover:text-gray-300 cursor-pointer ${
                  isActive ? "border-t-2 border-orange-400 text-white" : ""
                }`
              }
            >
             Home
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `text-sm font-medium hover:text-gray-300 cursor-pointer ${
                  isActive ? "border-t-2 border-orange-400 text-white" : ""
                }`
              }
            >
              Courses
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium hover:text-gray-300 cursor-pointer ${
                  isActive ? "border-t-2 border-orange-400 text-white" : ""
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-medium hover:text-gray-300 cursor-pointer ${
                  isActive ? "border-t-2 border-orange-400 text-white" : ""
                }`
              }
            >
              Contact
            </NavLink>

              {(isLoggedIn)? (<button 
              onClick={() => showModal(true)} 
              className="text-sm font-medium hover:text-gray-300 cursor-pointer"
            >
              Become an Instructor
            </button>)  : null }
            
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-transparent text-sm font-medium hover:text-gray-300 cursor-pointer pr-6"
              defaultValue="English"
            >
              <option value="English">English</option>
              <option value="Spanish">Hindi</option>
              <option value="French">Malayalam</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
