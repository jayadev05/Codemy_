import React from 'react'
import { Apple, Facebook, Instagram, Linkedin, PlayCircle, Twitter, Youtube } from 'lucide-react'
import logo from '../../../assets/logo_cap.png'

function SecondaryFooter() {
  return (
    <footer id='footer' className="bg-gray-900 text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className='flex gap-3 items-center'>
              <img src={logo} alt="Codemy Logo" className="h-8 w-auto" />
              <h3 className="text-2xl font-bold text-white">Codemy</h3>
            </div>
            
            <p className="text-sm text-gray-400">
              Learn on your schedule. Expert instructors. Courses for all levels.
            </p>
            <div className="flex gap-4 mt-5">
              <a 
                href="#" 
                className="hover:text-orange-500 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-orange-500 transition-colors"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-orange-500 transition-colors"
                aria-label="Visit our Twitter page"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-orange-500 transition-colors"
                aria-label="Visit our YouTube channel"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-orange-500 transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Top Categories</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Development
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Business
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Finance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  IT & Software
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* App Download Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Download Our App</h3>
            <div className="flex flex-col space-y-3 sm:flex-row lg:flex-col lg:space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Apple className="h-5 w-5" />
                <span className="text-sm font-medium">App Store</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <PlayCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Play Store</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} - Codemy. Designed by Templatecookie. All rights
            reserved
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SecondaryFooter

