
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Home from "./pages/user/Home";
import Dashboard from "./pages/admin/AdminDashboard";
import TutorManagement from "./pages/admin/tutorManage";
import UserProfile from "./pages/user/UserProfile";
import SettingsPage from "./pages/user/UserSettings";
import TutorSettings from "./pages/tutor/TutorSettings";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import PageNotFound from "./pages/general/404";
import StudentManagement from "./pages/admin/studentManage";
import SignUp from './pages/general/signup/Signup'
import Login from './pages/general/login/Login'
import ResetPassword from "./pages/general/PasswordReset";
import ForgotPassword from "./pages/general/ForgotPassword";
import 'react-toastify/dist/ReactToastify.css';
import UnauthorizedPage from "./pages/general/403";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import CategoryManagement from "./pages/admin/CategoryManagement";
import CourseCreation from "./pages/tutor/TutorAddCourse";
import TutorCourses from "./pages/tutor/TutorCourses";
import TutorViewCourse from "./pages/tutor/TutorViewCourse";
import TutorEditCourse from "./pages/tutor/TutorEditCourse";
import CourseListing from "./pages/course/AllCourses";
import WishlistPage from "./pages/user/Wishlist";
import CourseDetails from "./pages/course/CourseDetails";
import Cart from "./pages/course/Cart";
import CheckoutPage from "./pages/course/CheckoutPage";
import PurchaseCompleted from "./pages/course/PurchaseSuccess";
import PaymentFailed from "./pages/course/paymentFailurePage";
import CoursePlayer from "./pages/user/coursePlayer/VideoPlayerPage";
import ScrollToTop from "./components/utils/ScrollToTop";
import PurchaseHistory from "./pages/user/PurchaseHistory";
import ReportManagement from "./pages/admin/reportManagement";
import ChatPage from "./pages/user/ChatPage";
import TutorChatPage from "./pages/tutor/TutorChatPage";
import { socketService } from "./services/socket";
import { useEffect } from "react";
import { selectUser } from "./store/slices/userSlice";
import { selectTutor } from "./store/slices/tutorSlice";
import { selectAdmin } from "./store/slices/adminSlice";
import { useSelector } from "react-redux";
import CouponManagement from "./pages/admin/CouponManage";
import BillingPage from "./pages/admin/BillingPage";
import AboutPage from "./pages/user/About";
import ContactPage from "./pages/user/Contact";

function AppContent() {
  const user = useSelector(selectUser);
  const admin = useSelector(selectAdmin);
  const tutor = useSelector(selectTutor);
  const currentUser = user || admin || tutor;

  useEffect(()=>{

    const initializeSocket=()=>{
      const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
  
        if (!token || !currentUser?._id) return;
  
        // Socket connection
        try {

          socketService.connect(token, refreshToken);

          socketService.onConnect(() => {
         
            socketService.joinRoom(currentUser?._id);
             console.log("Connected to socket");
          });
    
          // Handle any connection errors
          socketService.onError((error) => {
            console.error("Socket connection error:", error);
          });

        } catch (error) {
          console.log("Failed to initialize socket" , error);
        }
        

        return ()=>{
          socketService.disconnect();
        }
    }

    initializeSocket();
    
  },[currentUser?._id]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* generic routes */}
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<ProtectedRoute isLoginPage><Login /></ProtectedRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/contact-us" element={<ContactPage/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />

        {/* admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute userType="admin"><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/manage-tutors" element={<ProtectedRoute userType="admin"><TutorManagement /></ProtectedRoute>} />
        <Route path="/admin/manage-students" element={<ProtectedRoute userType="admin"><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/category" element={<ProtectedRoute userType="admin"><CategoryManagement/></ProtectedRoute>} />
        <Route path="/admin/offer-management" element={<ProtectedRoute userType="admin"><CouponManagement/></ProtectedRoute>} />
        <Route path="/admin/manage-reports" element={<ProtectedRoute userType="admin"><ReportManagement/></ProtectedRoute>} />
        <Route path="/admin/billing" element={<ProtectedRoute userType="admin"><BillingPage/></ProtectedRoute>} />

        {/* user routes */}
        <Route path="/user/profile" element={<ProtectedRoute userType="user"><UserProfile /></ProtectedRoute>} />
        <Route path="/user/settings" element={<ProtectedRoute userType="user"><SettingsPage /></ProtectedRoute>} />
        <Route path="/user/wishlist" element={<ProtectedRoute userType="user"><WishlistPage /></ProtectedRoute>} />
        <Route path="/user/purchase-history" element={<ProtectedRoute userType="user"><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/user/messages" element={<ProtectedRoute userType="user"><ChatPage /></ProtectedRoute>} />
        <Route path="/user/cart" element={<ProtectedRoute userType="user"><Cart /></ProtectedRoute>} />
        <Route path="/user/play-course" element={<ProtectedRoute userType="user"><CoursePlayer /></ProtectedRoute>} />
        <Route path="/user/checkout" element={<ProtectedRoute userType="user"><CheckoutPage /></ProtectedRoute>} />
        <Route path="/user/payment-success/:orderId" element={<ProtectedRoute userType="user"><PurchaseCompleted /></ProtectedRoute>} />
        <Route path="/user/payment-failure/:orderId" element={<ProtectedRoute userType="user"><PaymentFailed /></ProtectedRoute>} />

        {/* tutor routes */}
        <Route path="/tutor/dashboard" element={<ProtectedRoute userType="tutor"><TutorDashboard /></ProtectedRoute>} />
        <Route path="/tutor/settings" element={<ProtectedRoute userType="tutor"><TutorSettings /></ProtectedRoute>} />
        <Route path="/tutor/create-course" element={<ProtectedRoute userType="tutor"><CourseCreation /></ProtectedRoute>} />
        <Route path="/tutor/myCourses" element={<ProtectedRoute userType="tutor"><TutorCourses/></ProtectedRoute>} />
        <Route path="/tutor/messages" element={<ProtectedRoute userType="tutor"><TutorChatPage/></ProtectedRoute>} />
        <Route path="/tutor/view-course" element={<ProtectedRoute userType="tutor"><TutorViewCourse/></ProtectedRoute>} />
        <Route path="/tutor/edit-course/:id" element={<ProtectedRoute userType="tutor"><TutorEditCourse/></ProtectedRoute>} />

        {/* course routes */}
        <Route path="/all-courses" element={<CourseListing />} />
        <Route path="/course/details" element={<CourseDetails />} />

        {/* Catch-all and error routes */}
        <Route path="*" element={<PageNotFound />} />
        <Route path="/forbidden" element={<UnauthorizedPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppContent;
