"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { logoutAdmin, selectAdmin } from "../../store/slices/adminSlice";
import { useNavigate } from "react-router";
import defProfile from "../../assets/user-profile.png";
import Pagination from "../../components/utils/Pagination";
import axios from "axios";
import { toast } from "react-hot-toast";
import Sidebar from "../../components/layout/admin/sidebar";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(3);

  const [courses, setCourses] = useState([]);
  const [courseToDelete, setCourseToDelete] = useState({})
  const [deleteModalOpen, setDeleteModalOpen] = useState()
  const [sortBy,setSortBy]=useState('all');

  const admin = useSelector(selectAdmin);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const stats = [
    { title: "Total Students", value: "134", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6738" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg> },
    { title: "Active Courses", value: "48", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6738" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>},
    { title: "Total Revenue", value: "₹150,000", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6738" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>},
    { title: "Total Tutors", value: "8", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6738" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg> },
  ];

  useEffect(()=>{
    fetchCourses();
  },[sortBy])

  console.log("courses",courses);

  const fetchCourses=async()=>{
    try {
      
      const response = await axios.get('http://localhost:3000/course/get-courses',{params:{sortBy}});

      setCourses(response.data.courses);
      

    } catch (error) {

      console.log(error);

      if(error.response){
        toast.error(error.response.message || "Failed to fetch courses")
      }
    }
  }

  const paginateData = (data) => {
    const startIndex = currentPage * coursesPerPage - coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    return data.slice(startIndex, endIndex);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/admin/logout");

      dispatch(logoutAdmin(admin));
      toast.success("Logged out successfully");
      navigate("/login");

     
    } catch (error) {
      console.log(error.message);
      toast.error(error.message || "Error Logging out user");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleToggleList = async (id, isListed) => {
    try {
      
      const endpoint = isListed ? "unlistCourse" : "listCourse";
      const response = await axios.put(`http://localhost:3000/admin/${endpoint}/${id}`);
  
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === id ? { ...course, isListed: !course.isListed } : course
        )
      );
  
      toast.success(
        isListed ? "Course Unlisted Successfully" : "Course Listed Successfully"
      );
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to List/Unlist course");
      }
    }
  };
  
  const handleDeleteClick = (id,tutorId) => {
    setDeleteModalOpen(true);
    setCourseToDelete({id:id,tutorId:tutorId});
    console.log("course to delete",courseToDelete);
};

const handleDeleteConfirm = async() => {
    try {
       
        if(courseToDelete.id){
            await axios.delete(`http://localhost:3000/course/delete-course?courseId=${courseToDelete.id}&tutorId=${courseToDelete.tutorId}`);

            setDeleteModalOpen(false);
            setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseToDelete.id));
            setCourseToDelete(null);
            toast.success('Course deleted successfully');
        }

        else toast.error("unable to find course id");

        
    } catch (error) {
        console.log(error);
        toast.error(error.response.message||"Error deleting the course")
    }
    
};



  const filteredItems = paginateData(courses);

  return (
    <div className="flex min-h-screen bg-gray-50 ">
      {/* Sidebar */}

      <div className="sticky top-0 h-screen">
      <Sidebar activeSection="Dashboard" />
      </div>
      

      {/* Main Content */}
      <main className="flex-1 ">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">Good Morning</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Search"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>

            {/* Dropdown container */}
            <div className="relative group">
              <img
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-10 w-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-500"
                src={admin?.profileImg || defProfile}
                alt=""
              />

              {/* Dropdown menu */}
              <div className="absolute right-0  w-48 bg-white rounded-md shadow-lg py-1 border hidden group-hover:block">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {admin?.userName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {admin?.email}
                  </p>
                </div>

                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
        </header>

        {/* Dashboard Content */}
        <div className="space-y-6 mt-6 px-12">

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow ">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 ">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 ">
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Courses Table */}
          <div className="rounded-lg bg-white p-6 shadow lg:min-h-[400px] ">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 ">
                  Active Courses
                </h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm "
                >
                  <option value="all">All Courses</option>
                  <option value="latest">Latest</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-500 ">
                    <th className="pb-3 pl-4 w-1/4">Course</th>
                    <th className="pb-3 w-1/6">Instructor</th>
                    <th className="pb-3 w-1/6">Students</th>
                    <th className="pb-3 w-1/6"> Price</th>
                    <th className="pb-3 w-1/6">Revenue</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
               
                <tbody className="divide-y  divide-gray-300 ">  
                { filteredItems.length===0?<span className="text-orange-400">No Courses to show</span>:
                  filteredItems.map((course) => (
                    <tr key={course._id} className="text-md">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="rounded object-cover aspect-video max-w-[120px]"
                          />
                          <span className="font-medium text-gray-900 w-2/3 ">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-2 text-gray-600 ">
                        {course.tutorId.fullName}
                      </td>
                      <td className="py-4 px-3 text-gray-600 ">{course.enrolleeCount}</td>
                      <td className="py-4 text-gray-900 ">₹{course.price.$numberDecimal}</td>
                      <td className="py-4 px-2 text-gray-900">
                        ₹{course.enrolleeCount * course.price.$numberDecimal}
                      </td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button

                          onClick={()=>handleToggleList(course._id,course.isListed)}
                          className={`${course.isListed?"bg-blue-500 hover:bg-blue-600" :"bg-green-500 hover:bg-green-600"} px-4 py-2 text-sm font-medium text-white  `}>
                            {course.isListed?"Unlist":"List"}
                          </button>
                          <button
                          onClick={()=>handleDeleteClick(course._id,course.tutorId._id)}
                          className="  px-3 py-1 text-xs font-medium text-white hover:bg-red-600 bg-red-500">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center">
          <Pagination
            className="flex items-center justify-between"
            totalData={courses.length}
            dataPerPage={coursesPerPage}
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
          />
          </div>
         
        </div>

      </main>

      {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete the course ?</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

    </div>
  );
}
