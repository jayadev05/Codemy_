import axios from "axios";
import { Heart, LogOut, Search, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser, selectUser } from "../../../store/slices/userSlice";
import logo from '../../../assets/logo_cap.png'
import { useNavigate } from "react-router";
import { selectCart } from "../../../store/slices/cartSlice";
import { selectWishlist } from "../../../store/slices/wishlistSlice";

const MainHeader = () => {

  const navigate=useNavigate()
    const dispatch=useDispatch();

    const user=useSelector(selectUser);
    const wishlist=useSelector(selectWishlist);
    const cart=useSelector(selectCart);
    


  
    const handleLogout = async () => {
      try {
        await axios.post("http://localhost:3000/user/logout");
        dispatch(logoutUser(user));
        toast.success("Logged out successfully");
      } catch (error) {
        toast.error(error.message || "Error logging out user");
      }
  
    };
    
    return (
      <header className="bg-white shadow-md py-3 px-4 ">
        <div className="container max-w-[1850px] flex justify-between items-center ">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="" />
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
                       <button className="px-1 py-2 rounded-md">
                         <i className="ri-notification-2-line hover:text-yellow-500"></i>
                       </button>
                       <button
                         onClick={() => navigate("/user/wishlist")}
                         className="relative px-1 py-2 rounded-md "
                       >
                         <i className="ri-heart-line text-xl hover:text-red-500"></i>
         
                         {/* Badge for wishlist count */}
         
                         {wishlist.length > 0 && (
                           <span className="absolute -top-0 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
                             {wishlist.length}
                           </span>
                         )}
                       </button>
                       <button 
                       onClick={()=>navigate('/user/cart')}
                       className="relative px-1 py-2 rounded-md">
                         <i className="ri-shopping-cart-line hover:text-orange-500"></i>

                         {/* Badge for cart count */}
         
                         {cart?.items?.length > 0 && (
                           <span className="absolute -top-0 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full px-[6px] py-[1px]">
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
                         <div className="absolute right-0 z-10 w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
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
      </header>
    )
  }

  export default MainHeader;