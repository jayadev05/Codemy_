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
import defProfile from "../../../../assets/user-profile.png";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { logoutTutor, selectTutor } from "../../../../store/tutorSlice";

const Sidebar = ({ activeSection }) => {
  const dispatch=useDispatch()

  const navigate=useNavigate()

  const onLogout=()=>{
    try {
      const response=axios.post("http://localhost:3000/tutor/logout");

      dispatch(logoutTutor(tutor));

      navigate('/login');

      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user")
    }
     
}

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/tutor/dashboard",
      isActive: activeSection === "Dashboard",
    },
    {
      title: "Create new Course",
      icon: Users,
      href: "",
      isActive: activeSection === "New Course",
    },
    {
      title: "My Courses",
      icon: GraduationCap,
      href: "",
      isActive: activeSection === "My Courses",
    },
    {
      title: "Message",
      icon: CreditCard,
      href: "#",
      isActive: activeSection === "Message",
    },
    {
      title: "Settings and profile",
      icon: Settings,
      href: "#",
      isActive: activeSection === "Settings and profile",
    },
    {
      title: "Offer management",
      icon: Ticket,
      href: "#",
      isActive: activeSection === "Offer management",
    },
  ];

  const tutor = useSelector(selectTutor);

  return (
    <div className="flex h-screen w-[240px] flex-col bg-gray-900">
      <div className="flex flex-col items-center gap-2 p-6">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-800">
          <img
            src={tutor?.profileImg || defProfile}
            alt="Tutor avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-sm font-medium text-gray-200">{tutor?.fullName}</span>
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
