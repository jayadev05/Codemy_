import axios from "axios";
import { Heart, LogOut, Search, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logoutUser, selectUser } from "../../../store/slices/userSlice";

const MainHeader = () => {
    const dispatch=useDispatch();
    const user=useSelector(selectUser);
  
  
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
        <div className="container mx-auto flex justify-between items-center ">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-orange-500">Codemy</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="What do you want to learn..."
                className="pl-10 pr-4 py-2 w-64 sm:w-80 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-300"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {[Search, Heart, ShoppingCart].map((Icon, index) => (
              <button key={index} className="p-1.5 hover:bg-gray-100 rounded-full transition duration-300">
                <Icon size={20} className="text-gray-600 hover:text-orange-500" />
              </button>
            ))}
            <button onClick={handleLogout} className='flex items-center gap-2 text-gray-600'>
            Logout
            <LogOut className="h-4 w-4"></LogOut>
           
            </button>
            
          </div>
        </div>
      </header>
    )
  }

  export default MainHeader;