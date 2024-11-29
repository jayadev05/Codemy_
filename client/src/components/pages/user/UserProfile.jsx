import React from 'react'
import { Bell, ChevronDown, Heart, Search, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../store/userSlice'
import defProfile from '../../../assets/user-profile.png'



const TopHeader = () => (

  <header className="bg-gray-800 text-white py-2 px-4">
    <div className="container mx-auto flex justify-between items-center">
      <nav className="flex space-x-4 text-sm">
        {['Home', 'Courses', 'About', 'Contact'].map((item) => (
          <a key={item} href="#" className="hover:text-gray-300">{item}</a>
        ))}
      </nav>
      <div className="flex items-center space-x-4 text-sm">
        <a href="#" className="hover:text-gray-300">Become an instructor</a>
        {['INR', 'English'].map((item) => (
          <div key={item} className="flex items-center space-x-1">
            <span>{item}</span>
            <ChevronDown size={12} />  
          </div>
        ))}
      </div>
    </div>
  </header>
)

const MainHeader = () => {
  const user=useSelector(selectUser);
  return (
  <header className="bg-white shadow-md py-2 px-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-bold text-orange-500">Codemy</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="What do you want learn..."
            className="pl-10 pr-4 py-2 w-96 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {[Search, Heart, ShoppingCart].map((Icon, index) => (
          <button key={index} className="p-2 hover:bg-gray-100 rounded-full">
            <Icon size={20} />
          </button>
        ))}
        <img src={user?.profileImg || defProfile} alt="" className='w-8' />
      </div>
    </div>
  </header>
  )
}

const UserProfile = () => {
  const user=useSelector(selectUser);

  return(
  <div className="bg-rose-50 py-8">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
     <img src={user?.profileImg || defProfile} alt="" className='w-20' />
          <h2 className="text-2xl font-semibold">Kevin Gilbert</h2>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300">
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
          {tabs.map((tab, index) => (
            <button
            onClick={()=>navigate(`/user/${tab}`)}
              key={tab}
              className={`px-4 py-4 ${index === 0 ? 'text-orange-500 border-b-2 border-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
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

const Footer = () => {
  const footerSections = [
    {
      title: "Codemy",
      content: "All parts of this site are copyrighted.",
      isMain: true
    },
    {
      title: "TOP 4 CATEGORY",
      items: ["Development", "Finance & Accounting", "Design", "Business"]
    },
    {
      title: "QUICK LINKS",
      items: ["Become Instructor →", "FAQs", "Terms & Conditions", "Privacy Policy"]
    },
    {
      title: "DOWNLOAD OUR APP",
      buttons: ["App Store", "Play Store"]
    }
  ]

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className={`${section.isMain ? 'text-2xl' : 'text-lg'} font-semibold mb-4`}>{section.title}</h3>
              {section.content && <p className="text-sm text-gray-400">{section.content}</p>}
              {section.items && (
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
              {section.buttons && (
                <div className="space-y-2">
                  {section.buttons.map((button, i) => (
                    <button key={i} className="bg-black text-white px-4 py-2 rounded-lg w-full text-left hover:bg-gray-800 transition duration-300">
                      {button}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center text-gray-400">
          © 2024 Codemy. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function CodemyClone() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <TopHeader />
      <MainHeader />
      <main className="flex-grow mb-4">
        <UserProfile />
        <Tabs />
        <Courses />
        <Pagination />
      </main>
      <Footer />
    </div>
  )
}

