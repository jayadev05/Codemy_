import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { Filter, Heart, Search, ShoppingBag, Star, X } from "lucide-react";
import { logoutUser, selectUser } from "../../store/slices/userSlice";
import Header from "../../components/layout/Header";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import logo from "../../assets/logo_cap.png";
import { addToWishlist, setWishlistItems } from "../../store/slices/wishlistSlice";
import MainHeader from "../../components/layout/user/MainHeader";
import { addToCart, selectCart } from "../../store/slices/cartSlice";

export default function CourseListing() {
  const user = useSelector(selectUser);
  const cart=useSelector(selectCart)


  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filters, setFilters] = useState({
    categories: [],
    ratings: [],
    levels: [],
    priceRange: { min: 0, max: 2000 },
  });
  const [categories, setCategories] = useState([]);


  const [page,setPage]=useState(1);

  useEffect(() => {
    fetchCourses();
  }, [searchQuery, sortBy, filters,page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(()=>{
    window.addEventListener('scroll',handleScroll);

    return ()=>window.removeEventListener('scroll',handleScroll);
  },[])


  const handleCourseView= (courseId)=>{
    try {
      
      navigate(`/course/details/${courseId}`);

    } catch (error) {
      console.log(error);
      toast.error( error.message || 'Failed to view course')
    }
  }

  const handleScroll =()=>{
    console.log('height',document.documentElement.scrollHeight)
    console.log('top',document.documentElement.scrollTop)
    console.log('window',window.innerHeight)

    if(window.innerHeight + document.documentElement.scrollTop +1>=document.documentElement.scrollHeight){
      setPage(prev=>prev+1)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/admin/get-categories"
      );
      setCategories(response.data);
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(
          error.response.data.message || "Failed to fetch category data"
        );
      }
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/course/get-wishlist",
        { params: { userId: user._id } }
      );
      setWishlist(response.data.wishlist);
      dispatch(setWishlistItems(response.data.wishlist));

    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/course/get-course-info",
        {
          params: {
            search: searchQuery,
            sortBy,
            page,
            limit: 8, 
            ...filters,
          },
        }
      );
      
      if (page === 1) {
        setCourses(response.data.courses);
      } else {
        setCourses(prev => [...prev, ...response.data.courses]);
      }
      
      // Optional: Track if there are more courses to load
      const hasMore = response.data.hasMore;
      if (!hasMore) {
        window.removeEventListener('scroll', handleScroll);
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/user/logout");
      dispatch(logoutUser(user));
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message || "Error logging out user");
    }
  };

  const FilterSection = () => (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isFilterOpen ? "translate-x-0" : "-translate-x-full"
      } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-30 overflow-y-auto`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setIsFilterOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">CATEGORY</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.title)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...filters.categories, category.title]
                      : filters.categories.filter((c) => c !== category.title);
                    handleFilterChange("categories", newCategories);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">{category.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">RATING</h3>
          <div className="space-y-2">
            {[4.5, 4.0, 3, 2.0].map((rating) => (
              <label key={rating} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.ratings.includes(rating)}
                  onChange={(e) => {
                    const newRatings = e.target.checked
                      ? [...filters.ratings, rating]
                      : filters.ratings.filter((r) => r !== rating);
                    handleFilterChange("ratings", newRatings);
                  }}
                  className="rounded border-gray-300"
                />
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {rating} & up
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Course Level Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">COURSE LEVEL</h3>
          <div className="space-y-2">
            {["Beginner", "Intermediate", "Expert"].map((level) => (
              <label key={level} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.levels.includes(level)}
                  onChange={(e) => {
                    const newLevels = e.target.checked
                      ? [...filters.levels, level]
                      : filters.levels.filter((l) => l !== level);
                    handleFilterChange("levels", newLevels);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Section */}

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">PRICE</h3>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="2000"
              value={filters.priceRange.max}
              onChange={(e) =>
                handleFilterChange("priceRange", {
                  ...filters.priceRange,
                  max: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">
                ₹{filters.priceRange.min}
              </span>
              <span className="text-sm text-gray-600">
                ₹{filters.priceRange.max}
              </span>
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={() => setIsFilterOpen(false)}
          className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  const handleWishlist = async (id) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/course/addToWishlist",
        {
          userId: user._id,
          courseId: id,
        }
      );

      if (response.status === 200) {
        toast.success("Course added to wishlist!");

        dispatch(addToWishlist(response.data.wishlist));

        fetchWishlist();

      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred",{icon:"🕴️",style:{borderRadius: '10px',
        background: '#eb5a0c',
        color: '#fff',}});
    }
  };


const handleAddToCart = async (courseId, price) => {
  try {
  
    const response = await axios.post('http://localhost:3000/course/addToCart', { 
      courseId, 
      userId: user._id 
    });

   dispatch(addToCart({ courseId, price }));

   toast.success("Item added to cart successfully",{icon: "🛒",style: {
    borderRadius: '10px',
    background: '#111826',
    color: '#fff',
  }})

  } catch (error) {
  
    console.error('Failed to add to cart', error);
    if(error.response)
    toast.error(error.response.data.message || "Failed to add to cart",{icon:"🕴️",style:{borderRadius: '10px',
      background: '#eb5a0c',
      color: '#fff',}})
  }
};

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 min-h-[90vh]">
       <MainHeader  />

        {/* Filter Section */}
        <FilterSection />

        {/* Overlay */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 text-sm bg-white rounded-md border shadow-sm flex items-center gap-1"
              >
                Filter
                <Filter className="w-4 pt-[2px]" />
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
              <select
                name="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                id="sortBy"
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="latest">Latest</option>
                <option value="trending">Trending</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {courses.map((course) => (
              <div
              
                key={course._id}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
              >
                <div className="relative aspect-[3/2] w-full">
                  <img
                  onClick={()=>handleCourseView(course._id)}
                    src={course.thumbnail}
                    alt={`${course.title} thumbnail`}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                  {user &&   <button
                    onClick={() => handleWishlist(course._id)}
                    className="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-300"
                    aria-label="Add to wishlist"
                  >
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                  </button> }
                
                </div>
                <div
               
                 className="flex flex-col flex-grow p-4">
                  <span className="inline-block self-start rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                    {course.categoryId.title}
                  </span>
                  <h3 
                   onClick={()=>handleCourseView(course._id)}
                  className="mt-2 text-lg font-semibold line-clamp-2 text-gray-900 flex-grow cursor-pointer">
                    {course.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(course.averageRating)
                              ? "text-orange-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
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
                    <button 
                    className="z-10"
                    onClick={()=>handleAddToCart(course._id,course.price)}
                    title="add to cart">
                      <ShoppingBag />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SecondaryFooter />
    </div>
  );
}