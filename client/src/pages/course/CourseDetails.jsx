import { useNavigate, useParams } from "react-router";
import Header from "../../components/layout/Header";
import MainHeader from "../../components/layout/user/MainHeader";
import SecondaryFooter from "../../components/layout/user/SecondaryFooter";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { PlayCircleIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import {
  addToWishlist,
  setWishlistItems,
} from "../../store/slices/wishlistSlice";
import { addToCart, selectCart } from "../../store/slices/cartSlice";
import { selectCourse } from "@/store/slices/courseSlice";
import axiosInstance from "@/config/axiosConfig";
import CourseReviews from "@/components/layout/user/CourseReviews";

export default function CourseDetails() {
  const user = useSelector(selectUser);
  const cart = useSelector(selectCart);
  const courseId = useSelector(selectCourse);

  const [course, setCourse] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const features = [
    "Comprehensive course materials and resources",
    "Practical exercises and real-world examples",
    "Chat support with tutors",
    "Certificate upon completion",
    "Lifetime access to course content",
    "Regular course updates",
  ];

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    fetchWishlist();
    fetchReviews();
  }, [course._id]);



  const handleAddToCart = async (courseId, price) => {
    try {
      const response = await axiosInstance.post("/user/cart", {
        courseId,
        userId: user._id,
      });

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
          icon: "⚠️",
          style: { borderRadius: "10px", background: "#111826", color: "#fff" },
        });
    }
  };

  const handleBuy = async (courseId, price) => {
    try {
      const response = await axiosInstance.post("/user/cart", {
        courseId,
        userId: user._id,
      });

      dispatch(addToCart({ courseId, price }));
      navigate("/user/cart");
    } catch (error) {
      console.error("Failed to add to cart", error);
      if (error.response)
        toast.error(error.response.data.message || "Failed to add to cart", {
          icon: "⚠️",
          style: { borderRadius: "10px", background: "#111826", color: "#fff" },
        });
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await axiosInstance.get(`/course/courses/basic-info`, {
        params: { courseId },
      });

    

      setCourse(response.data.course);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch course");
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/course/reviews`, {
        params: { courseId: course?._id },
      });

      if (response.status === 200) {
        setReviews(response.data.ratings);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ratings = course?.ratings?.length > 0 ? course.ratings : [0];



  // Calculate rating statistics
  const totalRatings = ratings.length;
  const averageRating = (
    ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings
  ).toFixed(1);
  const ratingCounts = ratings.reduce((counts, rating) => {
    counts[rating] = (counts[rating] || 0) + 1;
    return counts;
  }, {});

  // Calculate percentages for each rating
  const ratingPercentages = Object.fromEntries(
    [5, 4, 3, 2, 1].map((rating) => [
      rating,
      (((ratingCounts[rating] || 0) / totalRatings) * 100).toFixed(0),
    ])
  );

  const handleWishlist = async (id) => {
    try {
      const response = await axiosInstance.post("/user/wishlist", {
        userId: user._id,
        courseId: id,
      });

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

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get("/user/wishlist", {
        params: { userId: user._id },
      });
      setWishlist(response.data.wishlist);
      dispatch(setWishlistItems(response.data.wishlist));
    } catch (error) {
      console.log(error);
    }
  };

  const inWishlist = (courseId) => {
    const filtered = wishlist.filter(
      (course) => course.courseId._id === courseId
    );
    if (filtered.length > 0) return true;
    return false;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <MainHeader />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-orange-100 max-w-3xl">
                {course.shortDescription ||
                  "Embark on a journey of knowledge and skill development with our expertly crafted course."}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleBuy(course._id, course.price)}
                  className="px-8 py-3 bg-white text-orange-600 rounded-full font-semibold text-lg hover:bg-orange-100 transition-colors"
                >
                  Enroll Now
                </button>
                <button
                  onClick={() => handleAddToCart(course._id, course.price)}
                  className="px-8 py-3 bg-orange-700 text-white rounded-full font-semibold text-lg hover:bg-orange-800 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                <img
                  src={
                    course.thumbnail || "/placeholder.svg?height=720&width=1280"
                  }
                  alt="Course preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button className="w-20 h-20 bg-black bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors">
                    <PlayCircleIcon className="text-white w-full h-full" />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="text-3xl font-bold text-orange-600">
                  ₹{course?.price?.$numberDecimal}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Course Description
              </h2>
              <p className="text-gray-600">{course.description}</p>
            </section>

            <section className="mb-8 bg-orange-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                What you will get in this course
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-[#ff6738] mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Course Contents
              </h2>
              <p className="text-gray-600">
                {course?.courseContent?.split("\n").map((line, index) => (
                  <span key={index}>
                    {index + 1}. {line}
                    <br />
                    <br />
                  </span>
                ))}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Course Instructor
              </h2>
              <div className="flex items-start gap-4">
                {course.tutorId?.profileImg && (
                  <img
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    src={course.tutorId.profileImg}
                    alt="Instructor"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {course.tutorId?.fullName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {course.tutorId?.jobTitle}
                  </p>
                  <p className="text-gray-600">{course.tutorId?.bio}</p>
                </div>
              </div>
            </section>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Course Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">
                    ₹{course?.price?.$numberDecimal}
                  </span>

                  {user && (
                    <button
                      onClick={() => handleWishlist(course._id)}
                      className={`p-2 text-gray-500  hover:text-red-500 transition-colors `}
                      aria-label="Add to Wishlist"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill={`${inWishlist(course._id) ? "red" : "none"}`}
                        viewBox="0 0 24 24"
                        stroke={`${
                          inWishlist(course._id) ? "red" : "currentColor"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-32">Duration:</span>
                  <span>
                    {course.duration} {course.durationUnit}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-32">Lectures:</span>
                  <span>{course.lessons?.length}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-32">Level:</span>
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-32">Language:</span>
                  <span>{course.language}</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => handleAddToCart(course._id, course.price)}
                  className="w-full bg-[#ff6738] text-white py-3 rounded-lg font-medium mb-4 hover:bg-orange-600 transition-colors"
                >
                  Add to Cart
                </button>

                <button
                  onClick={() => handleBuy(course._id, course.price)}
                  className="w-full border border-orange-500 text-[#ff6738] py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Course Rating
          </h2>
          <div className="flex items-start gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-gray-800">
                {averageRating}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-500">Course Rating</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {"★".repeat(rating)}
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-orange-400 rounded"
                      style={{ width: `${ratingPercentages[rating]}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 w-10">
                    {ratingPercentages[rating]}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/*reviews */}
            <CourseReviews reviews={reviews} />
          </div>
        </section>
      </main>
      <SecondaryFooter />
    </div>
  );
}
