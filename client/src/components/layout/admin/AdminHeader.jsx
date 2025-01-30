import { Bell } from 'lucide-react';
import React from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router';
import { logoutAdmin, selectAdmin } from '@/store/slices/adminSlice'
import axiosInstance from '@/config/axiosConfig';

function AdminHeader({heading,subheading}) {
    const admin=useSelector(selectAdmin);
    const navigate=useNavigate();
    const dispatch=useDispatch();

    const handleLogout = async () => {
        try {
          await axiosInstance.post("/admin/auth/logout")
          dispatch(logoutAdmin(admin))
          toast.success("Logged out successfully")
          navigate("/login")
        } catch (error) {
          toast.error(error.message || "Error logging out")
        }
      }

  return (
    
          <header className="flex items-center  justify-between border-b bg-white px-6 py-4 ">
                     <div className='ml-10 lg:ml-0 '>
                       <h1 className="text-3xl font-bold">{heading}</h1>
                       <p className="mt-1 text-sm text-gray-500">
              {subheading}
            </p>
                       
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
                             onClick={handleLogout}
                               className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                             >
                               Logout
                             </button>
                           </div>
                         </div>
                     </div>
            </header>
    
  )
}

export default AdminHeader