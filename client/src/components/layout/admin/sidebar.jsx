import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  Ticket,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../../store/adminSlice";
import defProfile from "../../../assets/user-profile.png";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import axios from 'axios'

const Sidebar = ({ activeSection }) => {
  const dispatch=useDispatch()

  const navigate=useNavigate()

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

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      isActive: activeSection === "Dashboard",
    },
    {
      title: "Instructors",
      icon: Users,
      href: "/admin/manage-tutors",
      isActive: activeSection === "Instructors",
    },
    {
      title: "Students",
      icon: GraduationCap,
      href: "/admin/manage-students",
      isActive: activeSection === "Students",
    },
    {
      title: "Billing",
      icon: CreditCard,
      href: "#",
      isActive: activeSection === "Billing",
    },
    {
      title: "Settings and profile",
      icon: Settings,
      href: "#",
      isActive: activeSection === "Settings and profile",
    },
    {
      title: "Coupon management",
      icon: Ticket,
      href: "#",
      isActive: activeSection === "Coupon management",
    },
  ];

  const admin = useSelector(selectAdmin);

  return (
    <div className="flex h-screen w-[240px] flex-col bg-gray-900">
      <div className="flex flex-col items-center gap-2 p-6">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-800">
          <img
            src={admin?.profileImg || defProfile}
            alt="Admin avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-sm font-medium text-gray-200">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => (
          <a
            key={item.title}
            onClick={()=>navigate(`${item.href}`)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              item.isActive
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </a>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;