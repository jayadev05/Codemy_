import React from "react";
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useSelector } from "react-redux";
import { selectCourse } from "../../store/slices/courseSlice";
import { Bell, Search } from "lucide-react";
import { selectTutor } from "../../store/slices/tutorSlice";
import defProfile from "../../assets/user-profile.png";

function TutorViewCourse() {

  const tutor = useSelector(selectTutor);
  const course = useSelector(selectCourse);

  const ratings = course.ratings.length>0 ? course.ratings : [0];
 

  // Calculate rating statistics
  const totalRatings = ratings.length;
  const averageRating = (ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings).toFixed(1);
  const ratingCounts = ratings.reduce((counts, rating) => {
    counts[rating] = (counts[rating] || 0) + 1;
    return counts;
  }, {});

   // Calculate percentages for each rating
   const ratingPercentages = Object.fromEntries(
    [5, 4, 3, 2, 1].map(rating => [
      rating,
      ((ratingCounts[rating] || 0) / totalRatings * 100).toFixed(0)
    ])
  );

  const formatCurrency = (num) => {
    const cleanedNum = num.toString().replace(/[^\d]/g, "");
    return cleanedNum ? Number(cleanedNum).toLocaleString("en-IN") : "";
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen">
          <Sidebar activeSection={"My Courses"} />
        </div>

        {/* Main Content */}
        <main className="w-full">
          {/* Header */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
            <div>
              <h1 className="text-xl font-semibold">My Courses</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300"
                  placeholder="Search"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <img
                crossOrigin="anonymous"
                src={tutor.profileImg || defProfile}
                className="w-12 h-12 rounded-full"
                alt=""
              />
            </div>
          </header>

          {/* View course Content */}
          <div className="max-w-6xl mx-auto my-8 p-6 bg-white">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="w-full md:w-1/3">
                <img
                  src={course.thumbnail}
                  alt="Course preview"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-2">
                  Last updated: {new Date(course.updatedAt).toString()}
                </div>
                <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center gap-2 mb-4"></div>
                <div className="flex gap-4">
                  <div className="text-lg">
                    <span className="font-bold">
                      ₹{formatCurrency(course.price.$numberDecimal)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      Course price
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold">
                  {course.lessons.length}
                </div>
                <div className="text-sm text-gray-600">Lessons </div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50">
                <div className="text-2xl font-bold">
                  {course.ratings.length}
                </div>
                <div className="text-sm text-gray-600">Total Ratings</div>
              </div>
              <div className="p-4 rounded-lg bg-red-50">
                <div className="text-2xl font-bold">{course.enrolleeCount}</div>
                <div className="text-sm text-gray-600">Students enrolled</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold">{course.language}</div>
                <div className="text-sm text-gray-600">Course Language</div>
              </div>
              <div className="p-4 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold">₹{course.enrolleeCount*course.price.$numberDecimal}</div>
                <div className="text-sm text-gray-600">
                 Total Revenue
                </div>
              </div>
              <div className="p-4 rounded-lg bg-green-50">
                <div className="text-2xl font-bold">{course.level}</div>
                <div className="text-sm text-gray-600">Course level</div>
              </div>
            </div>

            {/* Rating Section */}

            <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Overall Course Rating</h2>
        <div className="flex items-center gap-8">
          <div className="text-center p-6 bg-orange-50 rounded-lg">
            <div className="text-4xl font-bold mb-1">{averageRating}</div>
            <div className="flex text-orange-400 justify-center mb-1">
              {'★'.repeat(Math.round(Number(averageRating)))}
            </div>
            <div className="text-sm text-gray-600">Course Rating</div>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex text-orange-400">{'★'.repeat(rating)}</div>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-orange-400 rounded" 
                      style={{ width: `${ratingPercentages[rating]}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">{ratingPercentages[rating]}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
             </div>

          </div>
        </main>
      </div>
    </>
  );
}

export default TutorViewCourse;
