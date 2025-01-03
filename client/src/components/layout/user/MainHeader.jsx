"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Heart,
  LogOut,
  Search,
  ShoppingCart,
  Bell,
  X,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Menu,
  User,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  addUser,
  logoutUser,
  selectUser,
} from "../../../store/slices/userSlice";
import logo from "../../../assets/logo_cap.png";
import { useNavigate } from "react-router";
import { selectCart } from "../../../store/slices/cartSlice";
import { selectWishlist } from "../../../store/slices/wishlistSlice";
import NotificationDetailModal from "./NotificationDetailsModal";
import defProfile from "../../../assets/user-profile.png";
import { socketService } from "@/services/socket";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/config/axiosConfig";

const formatTimeAgo = (date) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const MainHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const user = useSelector(selectUser);
  const wishlist = useSelector(selectWishlist);
  const cart = useSelector(selectCart);

  const notifications = user?.notifications;
  notifications?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    const handleNotification = async (notification) => {
      dispatch(
        addUser({
          ...user,
          notifications: [...user.notifications, notification],
        })
      );
    };

    socketService.on("newNotification", handleNotification);
    return () => {
      socketService.off("newNotification", handleNotification);
    };
  }, [user?._id]);

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("http://localhost:3000/user/logout");
      dispatch(logoutUser(user));
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message || "Error logging out user");
    }
  };

  const handleDeleteNotification = async (userId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/user/clear-notifications/${userId}`
      );
      dispatch(addUser(response.data.updatedUser));
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (
    notification,
    userId,
    notificationId
  ) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);

    try {
      const response = await axiosInstance.put(
        "http://localhost:3000/user/toggle-notifications",
        {
          userId,
          notificationId,
        }
      );
      dispatch(addUser(response.data.user));
    } catch (error) {
      toast.error("Failed to update notification status");
    }
  };

  return (
    <header className="bg-white shadow-md py-3 px-4">
      <div className="container max-w-[1850px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Codemy Logo" className="w-8" />
            <h1 className="text-2xl font-bold text-black hidden sm:block">
              Codemy
            </h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex relative flex-1 max-w-xl mx-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="What do you want to learn..."
              className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {!user ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/signup")}
                      >
                        Create Account
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => navigate("/login")}
                      >
                        Sign In
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                        <img
                          src={user.profileImg || defProfile}
                          alt=""
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate("/user/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate("/user/wishlist")}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Wishlist
                          {wishlist.length > 0 && (
                            <span className="ml-auto bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                              {wishlist.length}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => navigate("/user/cart")}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Cart
                          {cart?.items?.length > 0 && (
                            <span className="ml-auto bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                              {cart?.items?.length}
                            </span>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          {!user ? (
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/signup")}
                className="text-orange-500 hover:text-orange-600"
              >
                Create Account
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative"
                >
                  <Bell className="w-5 h-5 text-gray-700 hover:text-orange-500" />
                  {notifications?.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 max-h-[85vh] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            Notifications
                          </h2>
                          <p className="text-sm text-gray-500">
                            {notifications?.length} notifications
                          </p>
                        </div>
                        {notifications?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(user._id)}
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      <div className="overflow-y-auto max-h-[60vh]">
                        {!notifications?.length ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() =>
                                handleNotificationClick(
                                  notification,
                                  user._id,
                                  notification._id
                                )
                              }
                              className={`
                                p-4 border-b border-gray-100 last:border-0
                                hover:bg-gray-50 transition-colors cursor-pointer
                                ${
                                  notification.isRead
                                    ? "bg-gray-50"
                                    : "bg-white"
                                }
                              `}
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className={`text-sm font-medium ${
                                        notification.isRead
                                          ? "text-gray-700"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>
                                    <time
                                      className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1"
                                      dateTime={notification.createdAt}
                                    >
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(notification.createdAt)}
                                    </time>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                    {notification.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/user/wishlist")}
                className="relative"
              >
                <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                    {wishlist.length}
                  </span>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/user/cart")}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-orange-500" />
                {cart?.items?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                    {cart?.items?.length}
                  </span>
                )}
              </Button>

              {/* User Profile Dropdown */}
              <div className="relative group">
                <img
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                  src={user.profileImg || defProfile}
                  alt=""
                />

                <div className="absolute right-0 z-50 w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {user.userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <a
                    href="/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/user/settings"
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
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
      />
    </header>
  );
};

export default MainHeader;
