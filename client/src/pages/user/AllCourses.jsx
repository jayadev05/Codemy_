import Header from "../../components/layout/Header";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import logo from "../../assets/logo_cap.png";
import { Filter, Heart, Search, ShoppingBag } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CourseListing() {

  const user=useSelector(selectUser);

  const [courses,setCourses]=useState([]);
  const [searchQuery, setSearchQuery] = useState("");
const [sortBy, setSortBy] = useState("latest");
const [filters, setFilters] = useState({});

console.log(searchQuery,sortBy)


  console.log(courses)


  useEffect(() => {
    fetchCourses();
  }, [searchQuery, sortBy, filters]);
  

  const fetchCourses=async()=>{
    try {
      const response=await axios.get('http://localhost:3000/course/get-course-info',{
        params: {
          search: searchQuery,
          sortBy,
          ...filters,                                                                           
        },
      });
      setCourses(response.data.courses)
    } catch (error) {
      console.log(error);
    }
  }

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange =(e)=>{
    setSortBy(e.target.value)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">

        <nav
          className={`sticky z-10 top-0 flex items-center justify-between px-6 py-4 bg-white border-b md:py-3 
           
          `}
        >
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
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Dropdown menu */}
              {user && (
                <div className="relative group">
                  <img
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                    src={user.profileImg || defProfile}
                    alt=""
                  />

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
                      // onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            
            </div>
          )}
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm  bg-white rounded-md border shadow-sm flex items-center gap-1">
                Filter
                <Filter className="w-4 pt-[2px]"/>
              </button>
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search courses..."
                  className="w-64 px-4 py-2 text-sm rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select name="sortBy" value={sortBy} onChange={handleSortChange} id="sortBy">
                <option value="latest">Latest</option>
                <option value="trending">Trending</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
                  >
                    <div className="relative aspect-[3/2] w-full">
                      <img
                        src={course.thumbnail}
                        alt={`${course.title} thumbnail`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        className="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-300"
                        aria-label="Add to wishlist"
                      >
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                      </button>
                    </div>
                    <div className="flex flex-col flex-grow p-4">
                      <span className="inline-block self-start rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {course.categoryId.title}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold line-clamp-2 text-gray-900 flex-grow">
                        {course.title}
                      </h3>

                     

                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex text-orange-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(course.averageRating)
                                  ? "text-orange-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({course.enrolleeCount.toLocaleString()} students)
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          ₹{formatCurrency(course.price.$numberDecimal)}
                        </span>
                     <button title="add to cart">
                     <ShoppingBag/>
                     </button>
                    
                      </div>
                      

                      <div className="mt-3 flex items-center gap-2">
       
        
      </div>


                    </div>
                  </div>
                ))}
          </div>

        </div>

      </main>

      {/* Footer */}
      <SecondaryFooter />
    </div>
  );
}
