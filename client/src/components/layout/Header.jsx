"use client"

import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Header({ showModal, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false)

  const NavLinks = ({ onClick = () => {} }) => (
    <>
      <NavLink
        to="/"
        onClick={onClick}
        className={({ isActive }) =>
          `text-sm font-medium hover:text-gray-300 cursor-pointer ${
            isActive ? "border-t-2 border-orange-400 text-white" : ""
          }`
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/all-courses"
        onClick={onClick}
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
        onClick={onClick}
        className={({ isActive }) =>
          `text-sm font-medium hover:text-gray-300 cursor-pointer ${
            isActive ? "border-t-2 border-orange-400 text-white" : ""
          }`
        }
      >
        About
      </NavLink>
      <NavLink
        to="/contact-us"
        onClick={onClick}
        className={({ isActive }) =>
          `text-sm font-medium hover:text-gray-300 cursor-pointer ${
            isActive ? "border-t-2 border-orange-400 text-white" : ""
          }`
        }
      >
        Contact
      </NavLink>
      {isLoggedIn && (
        <button
          onClick={() => {
            showModal(true)
            onClick()
          }}
          className="text-sm font-medium hover:text-gray-300 cursor-pointer"
        >
          Become an Instructor
        </button>
      )}
    </>
  )

  return (
    <header className="bg-[#1d2026] text-[#8c94a3]">
      <div className="container mx-auto px-4 max-w-[1900px]">
        <nav className="flex items-center justify-between h-14">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-[#8c94a3] hover:text-white"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#1d2026] border-r-[#2d3139]">
              <div className="flex flex-col space-y-6 mt-6">
                <NavLinks onClick={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavLinks />
          </div>

          {/* Language Selector - Visible on all screens */}
          <Select defaultValue="English">
            <SelectTrigger className="w-[120px] bg-transparent border-none text-[#8c94a3] hover:text-white focus:ring-0">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent className="bg-[#1d2026] border-[#2d3139]">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Malayalam">Malayalam</SelectItem>
            </SelectContent>
          </Select>
        </nav>
      </div>
    </header>
  )
}

export default Header

