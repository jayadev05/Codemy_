'use client'

import axios from "axios"
import { Heart, LogOut, Search, ShoppingCart, Bell, X, Mail, AlertCircle, CheckCircle2, Clock, MessageSquare, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { addUser, logoutUser, selectUser, selectUserNotifications } from "../../../store/slices/userSlice"
import logo from '../../../assets/logo_cap.png'
import { useNavigate } from "react-router"
import { selectCart } from "../../../store/slices/cartSlice"
import { selectWishlist } from "../../../store/slices/wishlistSlice"
import { useEffect, useState } from "react"
import NotificationDetailModal from "./NotificationDetailsModal"
import defProfile from '../../../assets/user-profile.png'
import { socketService } from "@/services/socket"






const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}


const MainHeader = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

 const user=useSelector(selectUser);

  const wishlist = useSelector(selectWishlist)
  const cart = useSelector(selectCart)

  const notifications=user?.notifications;
  notifications?.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  console.log("notificationss",notifications)


  useEffect(() => {

    const handleNotification = async (notification) => {
      console.log("recieved notification")
      dispatch(addUser({
        ...user,
        notifications: [...user.notifications, notification]
      }));
  
    };
  
    // Attach the event listener
    socketService.on('newNotification', handleNotification);
  
    
    return () => {
      socketService.off('newNotification', handleNotification);
    };
  }, [user?._id]);
  


  const getIcon = (type) => {
    switch(type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      default:
        return <Mail className="w-5 h-5 text-gray-500" />
    }
  }


  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/user/logout")
      dispatch(logoutUser(user))
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error(error.message || "Error logging out user")
    }
  }

  const handleDeleteNotification = async (userId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/user/clear-notifications/${userId}`);
      dispatch(addUser(response.data.updatedUser));
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete notification');
    }
  };
  

  const handleNotificationClick = async (notification,userId,notificationId) => {

    setSelectedNotification(notification)
    setIsDetailModalOpen(true)

    console.log("notidaoidasd",userId,notificationId)

    try {
   
     const response= await axios.put('http://localhost:3000/user/toggle-notifications', {
         userId, notificationId 
      });

      dispatch(addUser(response.data.user));


      // Show detail modal
      
    
    } catch (error) {
      toast.error('Failed to update notification status')
    }
  }

  return (
    <header className="bg-white shadow-md py-3 px-4">
      <div className="container max-w-[1850px] flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Codemy Logo" />
          <h1 className="text-2xl font-bold text-black">Codemy</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="What do you want to learn..."
              className="pl-10 pr-4 py-2 w-64 sm:w-80 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
            />
          </div>
        </div>
        
        {!user ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 text-orange-500 rounded-md transition-colors hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-white bg-orange-500 rounded-md transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Notification Button and Modal */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Notifications ${notifications.length > 0 ? `(${notifications.filter((n)=>n.isRead===false).length} unread)` : ''}`}
              >
                <Bell className="w-5 h-5 text-gray-700 hover:text-orange-500" />
                {notifications.filter((n)=>!n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.filter((n)=>!n.isRead).length}
                  </span>
                )}
              </button>

              {/* Modal Backdrop */}
              {isNotificationsOpen && (

                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                  onClick={() => setIsNotificationsOpen(false)}
                />

              )}

            {/* Notifications Modal */}
<div className={`
  absolute right-[-200px] top-full mt-3 w-96 max-h-[85vh]
  bg-white rounded-lg shadow-xl border border-gray-200
  transform transition-all duration-200 ease-in-out z-50
  ${isNotificationsOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
`}>
  <div className="flex items-center justify-between p-4 border-b border-gray-200">
    <div className="flex items-center gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        <p className="text-sm text-gray-500">{notifications.length} notifications</p>
      </div>
      {notifications.length > 0 && (
        <button
          onClick={() => {      
            handleDeleteNotification(user._id);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
    <button
      onClick={() => setIsNotificationsOpen(false)}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Close notifications"
    >
      <X className="w-5 h-5 text-gray-500" />
    </button>
  </div>

  <div className="overflow-y-auto max-h-[60vh]">
    {notifications.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No notifications yet</p>
      </div>
    ) : (
      notifications.map((notification) => (
        <div
          key={notification._id}
          onClick={() => handleNotificationClick(notification,user._id,notification._id)}
          className={`
            p-4 border-b border-gray-100 last:border-0
            hover:${notification.isRead ?"bg-gray-300":"bg-gray-50"} transition-colors cursor-pointer
            ${notification.isRead ? 'bg-gray-200' : 'bg-white'}
          `}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
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

            </div>

            <button
              onClick={() => navigate("/user/wishlist")}
              className="relative px-1 py-2 rounded-md"
            >
              <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0 -right-2 bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => navigate('/user/cart')}
              className="relative px-1 py-2 rounded-md"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-orange-500" />
              {cart?.items?.length > 0 && (
                <span className="absolute -top-0 -right-2 bg-[#ff6738] text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                  {cart?.items?.length}
                </span>
              )}
            </button>

            <p>{user.userName}</p>

            {/* Dropdown container */}
            <div className="relative group">
              <img
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                src={user.profileImg || defProfile}
                alt=""
              />

              {/* Dropdown menu */}
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
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedNotification(null)
        }}
      />
    </header>
  )
}

export default MainHeader

