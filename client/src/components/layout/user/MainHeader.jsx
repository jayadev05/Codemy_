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
  Moon,
  MoonIcon,
  Badge,
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
import { clearCart, selectCart, setCart } from "../../../store/slices/cartSlice";
import { clearWishlsit, selectWishlist, setWishlistItems } from "../../../store/slices/wishlistSlice";
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
import { NavLink } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ThemeToggle from "@/components/utils/DarkModeToggle";

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

const MainHeader = ({showModal,isLoggedIn}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  useEffect(() => {

    if ((!wishlist || wishlist.length === 0) || (!cart || cart.length === 0)) {
      fetchBag();
    }
  }, []); 
  
  const fetchBag=async () =>{
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        axiosInstance.get('/user/cart', { params: { userId: user._id } }),
        axiosInstance.get('/user/wishlist', { params: { userId: user._id } })
      ]);
  
      
      dispatch(setCart(cartRes.data.cart));
      dispatch(setWishlistItems(wishlistRes.data.wishlist));

    } catch (error) {
      console.error('Error fetching cart or wishlist:', error);
    }
  }
  

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
      await axiosInstance.post("http://localhost:3000/user/auth/logout");

      dispatch(logoutUser(user));
      dispatch(clearCart(cart));
      dispatch(clearWishlsit(wishlist));

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message || "Error logging out user");
    }
  };

  const handleDeleteNotification = async (userId) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/user/users/${userId}/notifications/clear`
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
        "http://localhost:3000/user/notifications/toggle",
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

 

    const NavLinks = ({ onClick = () => {} }) => (
      <div className="flex flex-col gap-5 ml-2 pt-2">
        <NavLink
          to="/"
          onClick={onClick}
          className={({ isActive }) =>
            `text-sm font-medium hover:text-gray-300 cursor-pointer ${
              isActive ? " text-orange-500" : ""
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
              isActive ? " text-orange-500" : ""
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
              isActive ? " text-orange-500" : ""
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
              isActive ? "  text-orange-500" : ""
            }`
          }
        >
          Contact
        </NavLink>
        {isLoggedIn && (
          <button
            onClick={() => {
            
              setIsSheetOpen(false)
              showModal(true)
              onClick()
             
            }}
            className="text-sm font-medium hover:text-gray-800 cursor-pointer bg-orange-500 p-2 text-white"
          >
            Become an Instructor
          </button>
        )}
      </div>
    )

  return (
    <header className="bg-white dark:bg-slate-900 shadow-md py-3 px-4">
  <div className="container max-w-[1850px] mx-auto">
    <div className="flex items-center justify-between">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Codemy Logo" className="w-8" />
        <h1 className="text-2xl font-bold text-black dark:text-white hidden sm:block">
          Codemy
        </h1>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden md:flex relative flex-1 max-w-xl mx-4">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder="What do you want to learn..."
          className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
        />
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden">
      <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen(true)}
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[300px] p-0 bg-white dark:bg-gray-800">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b dark:border-gray-700 p-4">
                <SheetHeader className="mb-2">
                  <SheetTitle className="text-black dark:text-white">Menu</SheetTitle>
                </SheetHeader>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 bg-muted dark:bg-gray-700 text-black dark:text-white"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {/* Auth Section */}
                <div className="p-4 border-b dark:border-gray-700">
                  {!user ? (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-center dark:border-gray-600 dark:text-white"
                        onClick={() => navigate("/signup")}
                      >
                        Create Account
                      </Button>
                      <Button
                        className="w-full justify-center bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => navigate("/login")}
                      >
                        Sign In
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* User Profile */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-gray-700">
                        <Avatar>
                          <img
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            src={user.profileImg || defProfile}
                            alt={user.userName}
                          />
                          <AvatarFallback>{user.userName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate text-black dark:text-white">
                            {user.userName}
                          </p>
                          <p className="text-sm text-muted-foreground dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-muted/50 dark:hover:bg-gray-700"
                          onClick={() => navigate("/user/profile")}
                        >
                          <User className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
                          Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-muted/50 dark:hover:bg-gray-700"
                          onClick={() => navigate("/user/wishlist")}
                        >
                          <Heart className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
                          Wishlist
                          {wishlist?.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-primary text-primary-foreground dark:bg-orange-500 dark:text-white"
                            >
                              {wishlist?.length}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-muted/50 dark:hover:bg-gray-700"
                          onClick={() => navigate("/user/cart")}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" />
                          Cart
                          {cart?.items?.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-primary text-primary-foreground dark:bg-orange-500 dark:text-white"
                            >
                              {cart.items?.length}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive dark:text-red-500 dark:hover:bg-red-500/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="p-4">
                  <NavLinks onClick={() => setIsSheetOpen(false)} />
                </div>
              </div>
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
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500"
          >
            Create Account
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            Sign In
          </Button>
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative"
            >
              <Bell className="w-5 h-5 text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400" />
              {notifications?.filter((n) => !n.isRead)?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.isRead)?.length}
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
                <div className="absolute right-0 mt-2 w-96 max-h-[85vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Notifications
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notifications?.length} notifications
                      </p>
                    </div>
                    {notifications?.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="dark:text-white"
                        onClick={() => handleDeleteNotification(user._id)}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[60vh]">
                    {!notifications?.length ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
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
                            p-4 border-b border-gray-100 dark:border-gray-700 last:border-0
                            hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
                            ${
                              notification.isRead
                                ? "bg-gray-50 dark:bg-gray-700"
                                : "bg-white dark:bg-gray-800"
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
                                      ? "text-gray-700 dark:text-gray-300"
                                      : "text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <time
                                  className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1"
                                  dateTime={notification.createdAt}
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(notification.createdAt)}
                                </time>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
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
                <Heart className="w-5 h-5 text-gray-700 hover:text-red-500 dark:text-gray-300"/>
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                    {wishlist?.length}
                  </span>
                )}
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/user/cart")}
                className="relative "
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-orange-500 dark:text-gray-300" />
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

                <div className="absolute right-0 z-50 w-48 bg-white dark:bg-[#1d2026] rounded-md shadow-lg py-1 border hidden group-hover:block">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.userName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <a
                    href="/user/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300  hover:bg-gray-100"
                  >
                    Profile
                  </a>
                  <a
                    href="/user/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100"
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
