import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";
import defProfile from '../../../assets/user-profile.png'

const UserProfile = () => {
    const user = useSelector(selectUser);
    

    return (
      <div className="bg-rose-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img crossOrigin="anonymous" referrerPolicy="no-referrer" src={user?.profileImg || defProfile} className='w-16 h-16 rounded-full border-2 border-white shadow-md' alt="" />
              <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
            </div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300 text-sm font-semibold shadow-sm">
              Become Instructor →
            </button>
          </div>
        </div>
      </div>
    )
  }

  export default UserProfile;