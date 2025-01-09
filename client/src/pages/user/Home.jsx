import { useEffect, useState } from "react";
import { Search, ShoppingBag, Star, Trash } from "lucide-react";
import hero_img from "../../assets/hero_img-4.png";
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
import { BookOpen, Users, Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import Header from "../../components/layout/Header";
import {
  addToWishlist,
  clearWishlsit,
  setWishlistItems,
} from "../../store/slices/wishlistSlice";
import MainHeader from "../../components/layout/user/MainHeader";
import { addToCart, clearCart, selectCart } from "../../store/slices/cartSlice";
import axiosInstance from "@/config/axiosConfig";
import { setCurrentCourse } from "@/store/slices/courseSlice";

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

export default function Home() {
  const steps = [
    { number: 1, title: "Apply to become instructor" },
    { number: 2, title: "Build & edit your profile" },
    { number: 3, title: "Create your first course" },
    { number: 4, title: "Start teaching & earning" },
  ];

  const [courses, setCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cart = useSelector(selectCart);

  console.log(wishlist, "asdasdadasd");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/course/courses/basic-info"
      );
      setCourses(response.data.courses);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 403) {
        toast.error(
          "User has been invalidated . Please try to login again or check mail if you had requested to be a tutor"
        );
        navigate("/login");
      }
    }
  };

  const handleAddToCart = async (courseId, price) => {
    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/user/cart",
        {
          courseId,
          userId: user._id,
        }
      );

      dispatch(addToCart({ courseId, price }));

      toast.success("Item added to cart successfully", {
        icon: "🛒",
        style: {
          borderRadius: "10px",
          background: "#111826",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Failed to add to cart", error);
      if (error.response)
        toast.error(error.response.data.message || "Failed to add to cart", {
          icon: "🕴️",
          style: { borderRadius: "10px", background: "#111826", color: "#fff" },
        });
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:3000/user/wishlist",
        { params: { userId: user._id } }
      );
      setWishlist(response.data.wishlist);
      dispatch(setWishlistItems(response.data.wishlist));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCourseView = (courseId) => {
    try {
      dispatch(setCurrentCourse(courseId));
      navigate(`/course/details`);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to view course");
    }
  };

  const handleWishlist = async (id) => {
    try {
      const response = await axiosInstance.post(
        "http://localhost:3000/user/wishlist",
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
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  const isLoggedIn = user;

  return (
    <>
      <Header showModal={setShowModal} isLoggedIn={isLoggedIn} />
      <div className="min-h-screen  dark:bg-[#1d2026]">
        <MainHeader showModal={setShowModal} isLoggedIn={isLoggedIn} />

        <main className="container mx-auto px-10 py-10 ">
          <section className="grid items-center gap-10 md:grid-cols-2 lg:gap-16 ">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white tracking-tight">
                Learn with an <span className="text-orange-500">Expert</span>{" "}
                anytime, anywhere
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Our mission is to help people find the best course online and
                learn with experts anytime, anywhere.
              </p>
              {!user ? (
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-3 text-white bg-orange-500 rounded-md transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Create Account
                </button>
              ) : (
                ""
              )}
            </div>
            <div className="relative h-[300px] md:h-[400px]">
              <img
                src={hero_img}
                alt="Learning illustration"
                className="object-cover lg:w-[500px]"
              />
            </div>
          </section>

          {/* section-1 */}
          <section className="mt-16">
            <h2 className="mb-12 text-4xl font-extrabold text-center text-gray-800 dark:text-white tracking-tight">
              Browse Top Categories
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 transition-shadow bg-white dark:bg-slate-900 border rounded-lg dark:border-gray-700 hover:shadow-lg focus-within:ring-2 focus-within:ring-orange-500"
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
          <section className="mt-16 bg-gray-50 dark:bg-[#1d2026]">
            <div className="max-w-10xl mx-auto">
              <h2 className="mb-12 text-4xl font-extrabold text-center text-gray-800 dark:text-white tracking-tight">
                Best Selling Courses
              </h2>

              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto max-w-9xl px-2 sm:px-6 lg:px-3">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-900 dark:border border-gray-600 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
                  >
                    <div className="relative aspect-[3/2] max-h-[200px] w-full">
                      <img
                        onClick={() => handleCourseView(course._id)}
                        src={course.thumbnail}
                        alt={`${course.title} thumbnail`}
                        className="h-full w-full object-cover cursor-pointer"
                      />
                      {user && (
                        <button
                          onClick={() => handleWishlist(course._id)}
                          className="absolute top-2 right-2 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-300"
                          aria-label="Add to wishlist"
                        >
                          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow p-4">
                      <span className="inline-block self-start rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                        {course.categoryId.title}
                      </span>
                      <h3
                        onClick={() => handleCourseView(course._id)}
                        className="mt-2 text-lg font-semibold line-clamp-2 text-gray-900 dark:text-white flex-grow cursor-pointer"
                      >
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({course.enrolleeCount.toLocaleString()} students)
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ₹{formatCurrency(course.price.$numberDecimal)}
                        </span>
                        <button
                          onClick={() =>
                            handleAddToCart(course._id, course.price)
                          }
                          title="add to cart"
                        >
                          <ShoppingBag />
                        </button>
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
                  <h2
                    onClick={() => showModal(true)}
                    className="text-3xl font-bold mb-4 text-white"
                  >
                    Become an Instructor
                  </h2>
                  <p className="mb-6 text-indigo-100">
                    Instructors from around the world teach millions of
                    students. We provide the tools and skills to teach what you
                    love.
                  </p>
                  <button
                    onClick={() =>
                      isLoggedIn ? setShowModal(true) : navigate("/login")
                    }
                    className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 w-fit"
                  >
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
                        <p className="text-sm text-gray-600 dark:text-white">
                          {step.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        {showModal && <InstructorModal onClose={() => setShowModal(false)} />}
      </div>
    </>
  );
}
