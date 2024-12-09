import { useEffect, useState } from "react";
import { Search, Star } from "lucide-react";
import hero_img from "../../assets/hero_img.png";
import course1 from "../../assets/Course-1.png";
import course2 from "../../assets/Course-2.png";
import course3 from "../../assets/Course-3.png";
import logo from "../../assets/logo_cap.png";
import cat1 from "../../assets/cat-1.png";
import cat2 from "../../assets/cat-2.png";
import cat3 from "../../assets/cat-3.png";
import cat4 from "../../assets/cat-4.png";
import cat5 from "../../assets/cat-5.png";
import cat6 from "../../assets/cat-6.png";
import cat7 from "../../assets/cat-7.png";
import cat8 from "../../assets/cat-8.png";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addUser, selectUser, logoutUser } from "../../store/slices/userSlice";
import defProfile from "../../assets/user-profile.png";
import Footer from "../../components/layout/Footer";
import { InstructorModal } from "../general/signup/InstructorSignUp";
import {  BookOpen, Users } from 'lucide-react';
import { toast } from "react-hot-toast";
import axios from "axios";
import Header from "../../components/layout/Header";


const categories = [
  
  { name: "Label", courses: "21,245", bgColor: "bg-blue-100", img: cat1 },
  { name: "Business", courses: "12,245", bgColor: "bg-green-100", img: cat2 },
  {
    name: "Finance & Accounting",
    courses: "32,245",
    bgColor: "bg-orange-100",
    img: cat3,
  },
  {
    name: "IT & Software",
    courses: "22,245",
    bgColor: "bg-red-100",
    img: cat4,
  },
  { name: "Lifestyle", courses: "15,245", bgColor: "bg-yellow-100", img: cat5 },
  { name: "Design", courses: "12,245", bgColor: "bg-purple-100", img: cat6 },
  {
    name: "Health & Fitness",
    courses: "8,245",
    bgColor: "bg-green-100",
    img: cat7,
  },
  { name: "Music", courses: "9,245", bgColor: "bg-blue-100", img: cat8 },
];

const courses = [
  {
    id: 1,
    title: "Machine Learning & Data Science Bootcamp",
    price: 1400,
    rating: 4.9,
    students: "285.7K",
    img: course1,
  },
  {
    id: 2,
    title: "The Complete Web Development Course",
    price: 1400,
    rating: 4.8,
    students: "185.7K",
    img: course2,
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    price: 1400,
    rating: 4.9,
    students: "225.7K",
    img: course3,
  },
  {
    id: 4,
    title: "Photography Fundamentals",
    price: 1400,
    rating: 4.7,
    students: "165.7K",
    img: course1,
  },
  {
    id: 5,
    title: "Business Analytics Certificate Program",
    price: 1400,
    rating: 4.8,
    students: "195.7K",
    img: course2,
  },
  {
    id: 6,
    title: "UI/UX Design Professional Certificate",
    price: 1400,
    rating: 4.9,
    students: "205.7K",
    img: course1,
  },
  {
    id: 7,
    title: "Digital Marketing Masterclass",
    price: 1700,
    rating: 4.9,
    students: "205.7K",
    img: course1,
  },
  {
    id: 8,
    title: "UI/UX Design Professional Certificate",
    price: 1400,
    rating: 4.5,
    students: "205.7K",
    img: course3,
  },
];


export default function Home() {
  const steps = [
    { number: 1, title: "Apply to become instructor" },
    { number: 2, title: "Build & edit your profile" },
    { number: 3, title: "Create your first course" },
    { number: 4, title: "Start teaching & earning" },
  ]

  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/user/logout");
      dispatch(logoutUser(user));
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message || "Error logging out user");
    }
  };
  
  const isLoggedIn=user;

  return (
    <>
    <Header showModal={setShowModal} isLoggedIn={isLoggedIn}/>
      <div className="min-h-screen bg-white">
       
        <nav className={`sticky z-10 top-0 flex items-center justify-between px-6 py-4 bg-white border-b md:py-3 ${showModal ? 'relative z-[-0]' : ''}` }>
          <div className="flex items-center gap-8">
            <a
              href="/"
              className="flex items-center text-2xl font-semibold text-[#1d2026]"
            >
              <img
                src={logo}
                alt="Codemy Logo"
                width={30}
                height={30}
                className="mr-2"
              />
              Codemy
            </a>
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="What do you want to learn..."
                className="w-[300px] pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                className="absolute top-2.5 left-3 text-[#1d2026]"
                size={20}
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
                <i className="ri-notification-2-line"></i>
              </button>
              <button className="px-1 py-2 rounded-md">
                <i className="ri-heart-line"></i>
              </button>
              <button className="px-1 py-2 rounded-md">
                <i className="ri-shopping-cart-line"></i>
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
                <div className="absolute right-0  w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
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
        </nav>

        <main className="container mx-auto px-10 py-10">
          <section className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
  Learn with an <span className="text-orange-500">Expert</span> anytime, anywhere
</h1>
<p className="text-base text-gray-600 leading-relaxed">
  Our mission is to help people find the best course online and learn with experts anytime, anywhere.
</p>
             {!user?
               <button
               onClick={() => navigate("/signup")}
               className="px-6 py-3 text-white bg-orange-500 rounded-md transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
             >
               Create Account
             </button> : ""
             }
             
            </div>
            <div className="relative h-[300px] md:h-[400px]">
              <img
                src={hero_img}
                alt="Learning illustration"
                className="object-cover h-full w-full"
              />
            </div>
          </section>

          {/* section-1 */}
          <section className="mt-16">
          <h2 className="mb-12 text-4xl font-extrabold text-center text-gray-800 tracking-tight">
  Browse Top Categories
</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 transition-shadow bg-white border rounded-lg hover:shadow-lg focus-within:ring-2 focus-within:ring-orange-500"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <img src={category.img} alt="" width={24} height={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category.courses} Courses
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* section-2 */}
          <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
      <h2 className="mb-12 text-4xl font-extrabold text-center text-gray-800 tracking-tight">
  Best Selling Courses
</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={course.img}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-orange-600">
                    ${course.price.toLocaleString()}
                  </span>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm">24 Lessons</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">{course.students} Students</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
          {/* //section 3 */}
          <section className="mt-16">
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-indigo-700 rounded-lg p-8 text-white flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4 text-white">
  Become an Instructor
</h2>
                  <p className="mb-6 text-indigo-100">
                    Instructors from around the world teach millions of
                    students. We provide the tools and skills to teach what you
                    love.
                  </p>
                  <button onClick={() => isLoggedIn? (setShowModal(true)):(navigate("/login"))} className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 w-fit">
                    Start Teaching →
                  </button>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">
                    Your teaching & earning steps
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {steps.map((step) => (
                      <div
                        key={step.number}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                          {step.number}
                        </div>
                        <p className="text-sm text-gray-600">{step.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer/>
        {showModal && <InstructorModal onClose={() => setShowModal(false)} />}
        
      </div>
    </>
  );
}
