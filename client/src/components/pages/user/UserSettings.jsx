import React from 'react'
import { Bell, ChevronDown, Heart, Search, ShoppingCart, Eye, EyeOff } from 'lucide-react'
import defProfile from '../../../assets/user-profile.png'
import { useSelector } from 'react-redux'
import { selectUser } from '../../../store/userSlice'


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
        {['USD', 'English'].map((item) => (
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
  console.log(user)

  return (
    <div className="bg-rose-50 py-8">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={user?.profileImg || defProfile} className='w-20' alt="" />
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
  const tabs = ['Courses', 'Message', 'Wishlist', 'Purchase History', 'Settings']
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-4 ${tab === 'Settings' ? 'text-orange-500 border-b-2 border-orange-500 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const SettingsForm = () => {
  const [showPassword, setShowPassword] = React.useState({
    current: false,
    new: false,
    confirm: false
  })

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-6">Account settings</h3>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2">
                <img
                  src={defProfile}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-center text-sm text-gray-500">
                Image size should be under 3MB and image ratio needs to be 1:1
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                placeholder="Enter your mobile no."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300">
              Save Changes
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-6">Change password</h3>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {['Current Password', 'New Password', 'Confirm Password'].map((label, index) => {
              const field = label.toLowerCase().replace(' ', '')
              return (
                <div key={label} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword[field] ? 'text' : 'password'}
                      placeholder={label}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )
            })}
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300">
              Change Password
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

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

export default function SettingsPage() {

 

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <TopHeader />
      <MainHeader />
      <main className="flex-grow mb-4">
        <UserProfile />
        <Tabs />
        <SettingsForm />
      </main>
      <Footer />
    </div>
  )
}

