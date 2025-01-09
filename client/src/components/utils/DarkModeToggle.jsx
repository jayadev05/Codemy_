"use client"


import { Moon, Sun } from 'lucide-react'
import { motion } from "framer-motion"
import { useEffect, useState } from 'react'

export default function ThemeToggle({className}) {

  const [theme, setTheme] = useState(() => {

    // Check if we're in the browser
    if (typeof window !== 'undefined') {
   
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme
      }
      // If no saved preference, check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  
  const isDark = theme === 'dark'

  useEffect(() => {
 
    localStorage.setItem('theme', theme)

    // Update document classes
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }
  return (
    <button
      onClick={toggleTheme}
    className={`relative h-8 w-16 rounded-full bg-slate-200 p-1 transition-colors duration-200 dark:bg-slate-800 dark:border dark:border-slate-800 ${className}`}
      aria-label="Toggle theme"
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full transition-colors" />

      {/* Thumb with icon */}
      <motion.div
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
        animate={{
          x: isDark ? "2rem" : "0rem",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotateZ: isDark ? 360 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-slate-800" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  )
}

