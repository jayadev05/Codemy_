import React from 'react'
import logo from '../../../assets/logo_cap.png'

function SecondaryFooter() {
  return (
    <footer id='footer' className="bg-gray-900 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10 ">
          <div className="grid ms-24 grid-cols-1 md:grid-cols-4 gap-24">
            <div>
              <div className='flex gap-3 items-center '>
              <img src={logo} alt="" />
              <h3 className="text-2xl font-bold text-white align-middle">Codemy</h3>
              </div>
              
              <p className="text-sm text-gray-400">
                Learn on your schedule. Expert instructors. Courses for all levels.
              </p>
              <div className="flex gap-4 mt-5">
                  <a href="#" className="hover:text-indigo-500">
                    <i class="ri-facebook-fill"></i>
                  </a>
                  <a href="#" className="hover:text-indigo-500">
                    <i class="ri-linkedin-fill"></i>
                  </a>
                  <a href="#" className="hover:text-indigo-500">
                    <i class="ri-twitter-fill"></i>
                  </a>
                  <a href="#" className="hover:text-indigo-500">
                    <i class="ri-youtube-fill"></i>
                  </a>
                  <a href="#" className="hover:text-indigo-500">
                    <i class="ri-instagram-fill"></i>
                  </a>
                </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Top Categories</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Development</li>
                <li>Business</li>
                <li>Finance</li>
                <li>IT & Software</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Download Our App</h3>
              <div className="space-y-2">
                <button className="w-1/2 bg-orange-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
                <i class="ri-apple-fill"></i>
                  App Store
                </button>
                <button className="w-1/2 bg-orange-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2">
                <i class="ri-google-play-line"></i>
                  Play Store
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 items-center border-t  border-gray-800  md:flex-row  gap-4">
              <div className="text-gray-400 text-sm w-full text-center">
                © 2021 - Codemy. Designed by Templatecookie. All rights
                reserved 2024
              </div>
              
            </div>

        </div>
      </footer>
  )
}

export default SecondaryFooter
