import React from 'react'
import { Bell, ChevronDown, Heart, Search, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/userSlice'
import defProfile from '../../assets/user-profile.png'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'





const MainHeader = () => {
  return (
    <header className="bg-white shadow-md py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
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
        </div>
      </div>
    </header>
  )
}

const UserProfile = () => {
  const user = useSelector(selectUser);
  console.log(user)

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

const Tabs = () => {
  const navigate=useNavigate()
  const tabs = ['Courses', 'Message', 'Wishlist', 'Purchase History', 'Settings']
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={()=>{
                switch(tab){
                  case "Courses":
                    navigate("/user/profile");
                    break;

                  case "Settings":
                    navigate("/user/settings");
                    break;
                }
              }}
              className={`px-4 py-3 text-sm ${tab === 'Courses' ? 'text-orange-500 border-b-2 border-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'} transition duration-300`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const CourseCard = ({ title, description, progress, image }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <img src={image} alt={title} className="w-full h-40 object-cover" />
    <div className="p-4">
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <h4 className="font-medium mb-4 text-sm">{title}</h4>
      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition duration-300">
        {progress}
      </button>
    </div>
  </div>
)

const Courses = () => {
  const courses = [
    {
      title: "21. Learn More About Web Design",
      description: "Learn Official Guide from Codemy",
      progress: "Watch Lecture",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "101. User Experience Design 3 : Create...",
      description: "UX/UI Web Design Master Course",
      progress: "Watch Lecture",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "7. Adding Content to Our Website",
      description: "Complete Web Design: From Figma to Webflow",
      progress: "25% Completed",
      image: "/placeholder.svg?height=200&width=300"
    },
    {
      title: "101. CSS Font Property Challenge Solut...",
      description: "Modern Frontend Development Course",
      progress: "Watch Lecture",
      image: "/placeholder.svg?height=200&width=300"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Courses (8)</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search in your courses..."
            className="px-4 py-2 border rounded-lg text-sm"
          />
          {['Latest', 'All Courses', 'All Teachers'].map((option) => (
            <select key={option} className="px-4 py-2 border rounded-lg text-sm">
              <option>{option}</option>
            </select>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </div>
  )
}

const Pagination = () => (
  <div className="flex justify-center mt-8 space-x-2">
    <button className="px-3 py-1 border rounded-full text-orange-500 hover:bg-orange-100">←</button>
    {[1, 2, 3, 4, 5].map((page) => (
      <button
        key={page}
        className={`px-3 py-1 border rounded-full ${page === 1 ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        {page.toString().padStart(2, '0')}
      </button>
    ))}
    <button className="px-3 py-1 border rounded-full text-orange-500 hover:bg-orange-100">→</button>
  </div>
)



export default function UserDashboard() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header/>
      <MainHeader />
      <main className="flex-grow mb-4">
        <UserProfile />
        <Tabs />
        <Courses />
        <Pagination />
      </main>
      <Footer/>
    </div>
  )
}

