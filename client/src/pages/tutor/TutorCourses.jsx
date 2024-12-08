import { Bell, Search, MoreVertical, Eye, Edit, Trash } from 'lucide-react';
import Sidebar from "../../components/layout/tutor/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { selectTutor } from "../../store/tutorSlice";
import defProfile from '../../assets/user-profile.png'
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from 'react-router';
import { addCourse } from '../../store/slices/courseSlice';

export default function TutorCourses() {
    const tutor = useSelector(selectTutor);
    const navigate=useNavigate();
    const dispatch=useDispatch()

    const [courses, setCourses] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const tutorId=tutor._id;

    const formatCurrency = (num) => {
        const cleanedNum = num.toString().replace(/[^\d]/g, '');
        return cleanedNum ? Number(cleanedNum).toLocaleString('en-IN') : '';
    };

    const fetchmyCourses = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/course/tutor-courses/${tutor._id}`);
            setCourses(response.data.courses);
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error fetching courses")
        }
    }

    useEffect(() => {
        fetchmyCourses()
    }, [tutor._id])

    const handleDropdownToggle = (courseId) => {
        setActiveDropdown(activeDropdown === courseId ? null : courseId);
    };

    const handleViewCourse= async(id)=>{
        try {
            const response= await axios.get(`http://localhost:3000/course/view-course/${id}`);

            dispatch(addCourse(response.data.data));
        
            navigate('/tutor/view-course');

        } catch (error) {
            console.log(error);
            if(error.response){
                toast.error(error.response?.data?.message ||"Error displaying course")
            }
        }
    }

    const handleEditCourse=async(id)=>{
        try {
            const response= await axios.get(`http://localhost:3000/course/view-course/${id}`);

            dispatch(addCourse(response.data.data));
        
            navigate(`/tutor/edit-course/${id}`);

        } catch (error) {
            console.log(error);
            if(error.response){
                toast.error(error.response?.data?.message ||"Error displaying course")
            }
        }
    }

    const handleDeleteClick = (id,title) => {
        setDeleteModal(true);
        setCourseToDelete(id);
    };

    const handleDeleteConfirm = async() => {
        try {
            console.log(courseToDelete);
            if(courseToDelete){
                await axios.delete(`http://localhost:3000/course/delete-course?courseId=${courseToDelete}&tutorId=${tutorId}`);

                setDeleteModalOpen(false);
                setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseToDelete));
                setCourseToDelete(null);
                toast.success('Course deleted successfully');
            }

            else toast.error("unable to find course id")

            
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message||"Error deleting the course")
        }
        
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar activeSection={"My Courses"}/>
            <main className="w-full">
                <header className="flex items-center justify-between border-b bg-white px-6 py-4 ">
                    <div>
                        <h1 className="text-xl font-semibold">My Courses</h1>
                        <p className="text-sm text-gray-500">Good Morning</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input className="w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300" placeholder="Search" />
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <Bell className="h-5 w-5" />
                        </button>
                        <img crossOrigin="anonymous" src={tutor.profileImg || defProfile} className="w-12 h-12 rounded-full" alt="" />
                    </div>
                </header>

                <div className="my-6 ml-24 flex gap-4">
                    <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                        <option>Latest</option>
                        <option>Popular</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                    <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                        <option>All Category</option>
                        <option>Development</option>
                        <option>Design</option>
                        <option>Business</option>
                    </select>
                    <select className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                        <option>4 Star & up</option>
                        <option>3 Star & up</option>
                        <option>2 Star & up</option>
                        <option>1 Star & up</option>
                    </select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mx-24">
                    {courses.map((course) => (
                        <div key={course._id} className=" overflow-hidden rounded-lg  bg-white shadow ">
                            <div className="aspect-video w-full">
                                <img
                                    src={course.thumbnail}
                                    alt="Course thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <span className="inline-block rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                                    {course.category}
                                </span>
                                <h3 className="mt-2 line-clamp-2 font-medium">
                                    {course.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex text-orange-400">
                                        {"★".repeat(Math.floor(course.averageRating))}
                                        {"☆".repeat(5 - Math.floor(course.averageRating))}
                                    </div>
                                    <span className="text-sm text-gray-500">{course.averageRating}</span>
                                    <span className="text-sm text-gray-500">
                                        ({course.enrolleeCount} students)
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="font-semibold">₹{formatCurrency(course.price.$numberDecimal)}</span>
                                    <div >
                                        <button 
                                            className="text-sm text-gray-500 hover:text-gray-700"
                                            onClick={() => handleDropdownToggle(course._id)}
                                            aria-haspopup="true"
                                            aria-expanded={activeDropdown === course._id}
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                        {activeDropdown === course._id && (
                                            <div className="absolute  right-[-10] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    <button onClick={()=>handleViewCourse(course._id)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">                                                      
                                                        <Eye className="mr-3 h-5 w-5" /> View Details
                                                    </button>
                                                    <button 
                                                    onClick={()=>handleEditCourse(course._id)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                                                        <Edit className="mr-3 h-5 w-5" /> Edit Course
                                                    </button>
                                                    <button 
                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left" 
                                                        role="menuitem"
                                                        onClick={() => handleDeleteClick(course._id)}
                                                    >
                                                        <Trash className="mr-3 h-5 w-5" /> Delete Course
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete the course ?</p>
                        <div className="flex justify-end gap-4">
                            <button 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setDeleteModal(false)}
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
    )
}

