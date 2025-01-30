"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Settings,
  Ticket,
  LogOut,
  LayoutList,
  MessageCircleWarning,
  Menu,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../../store/slices/adminSlice";
import defProfile from "../../../assets/user-profile.png";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const AdminSidebar = ({ activeSection }) => {
  const admin = useSelector(selectAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const onLogout = async () => {
    try {
      await axios.post("/admin/auth/logout");
      dispatch(logoutAdmin(admin));
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user");
    }
  };

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
      title: "Category Management",
      icon: LayoutList,
      href: "/admin/category",
      isActive: activeSection === "Category",
    },
    {
      title: "Report Management",
      icon: MessageCircleWarning,
      href: "/admin/manage-reports",
      isActive: activeSection === "Reports",
    },
    {
      title: "Billing",
      icon: CreditCard,
      href: "/admin/billing",
      isActive: activeSection === "Billing",
    },
    {
      title: "Coupon management",
      icon: Ticket,
      href: "/admin/offer-management",
      isActive: activeSection === "Coupons",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-screen w-full flex-col bg-gray-900">
      <div className="flex flex-col items-center gap-2 p-6">
        <div className="h-14 w-14 overflow-hidden rounded-full bg-gray-800">
          <img
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            src={admin?.profileImg || defProfile}
            alt="Admin avatar"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-sm font-medium text-gray-200">Admin</span>
      </div>
      <nav className="flex-1 space-y-1.5 px-3">
        {menuItems.map((item) => (
          <a
            key={item.title}
            onClick={() => {
              navigate(`${item.href}`);
              setIsMobileOpen(false);
            }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
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

  return (
    <>
      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-[240px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-[240px]">
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;
