import React from "react";
import { NavLink } from "react-router-dom";
import appleLogo from "../../assets/apple.png";
import googlePlayStoreLogo from "../../assets/google-play.svg";
import logo from '../../assets/logo_cap.png'

function Footer() {
  return (
    <>
      <footer className="bg-[#1C1C1C] text-white">
        {/* Stats Section */}
        <div className="container mx-auto px-5 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Start learning with 67.1k
                <br />
                students around the world.
              </h2>
              <div className="flex gap-4">
                <button className="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-800">
                  Join The Family
                </button>
                <button className="border border-white px-6 py-2 rounded-lg hover:bg-white/10">
                  Browse All Courses
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">6.3k</div>
                <div className="text-gray-400">Online courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">26k</div>
                <div className="text-gray-400">Certified Instructor</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-5 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {/* Logo and Social Links */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <div className="text-2xl font-bold flex items-center gap-2"><img src={logo} alt="" /> Codemy</div>
                </div>
                <p className="text-gray-400 mb-6">
                  Learn on your schedule. Expert instructores. Course for all levels
                </p>
                <div className="flex gap-4">
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

              {/* TOP 4 CATEGORY */}
              <div>
                <h3 className="text-lg font-semibold mb-4">TOP 4 CATEGORY</h3>
                <ul className="space-y-3">
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Development
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Finance & Accounting
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Design
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Business
                    </NavLink>
                  </li>
                </ul>
              </div>

              {/* QUICK LINKS */}
              <div>
                <h3 className="text-lg font-semibold mb-4">QUICK LINKS</h3>
                <ul className="space-y-3">
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      About
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Contact
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Career
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white inline-flex items-center"
                    >
                      Become Instructor <span className="ml-2">→</span>
                    </NavLink>
                  </li>
                </ul>
              </div>

              {/* SUPPORT */}
              <div>
                <h3 className="text-lg font-semibold mb-4">SUPPORT</h3>
                <ul className="space-y-3">
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Help Center
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      FAQs
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Terms & Condition
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      href="#"
                      className="text-gray-400 hover:text-white"
                    >
                      Privacy Policy
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © 2021 - EduSpec. Designed by Templatecookie. All rights
                reserved
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-lg hover:bg-gray-900"
                >
                  <img src={appleLogo} alt="App Store" className="h-8 me-4" />
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-lg hover:bg-gray-900"
                >
                  <img
                    src={googlePlayStoreLogo}
                    alt="Play Store"
                    className="h-10"
                  />
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-sm font-semibold">Play Store</div>
                  </div>
                </a>
                
              </div>
            </div>
            
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
