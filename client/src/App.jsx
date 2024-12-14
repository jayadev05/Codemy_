
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Home from "./pages/user/Home";
import { store, persistor } from "../src/store/store";
import Dashboard from "./pages/admin/AdminDashboard";
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from "@react-oauth/google";
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
import { Toaster } from 'react-hot-toast';
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
import Cart from "./pages/user/Cart";
import CheckoutPage from "./pages/user/CheckoutPage";
import PurchaseCompleted from "./pages/user/PurchaseSuccess";




function App() {
  return (
    

    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId="532055856231-5bvv6o4cog4srbvvghv969kfenmd33cl.apps.googleusercontent.com">
          <Toaster position="top-right"/>
          <BrowserRouter>
            <Routes>

              {/* generic routes */}
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/login" element={<ProtectedRoute isLoginPage><Login /></ProtectedRoute>} />
              <Route path="/" element={<Home/>} />
              <Route path="/reset-password/:token" element={<ResetPassword/>} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />



              {/* admin routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute userType="admin"><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/manage-tutors" element={<ProtectedRoute userType="admin"><TutorManagement /></ProtectedRoute>} />
              <Route path="/admin/manage-students" element={<ProtectedRoute userType="admin"><StudentManagement /></ProtectedRoute>} />
              <Route path="/admin/category" element={<ProtectedRoute userType="admin"><CategoryManagement/></ProtectedRoute>} />
             
             
             
              {/* //user routes */}
              <Route path="/user/profile" element={<ProtectedRoute userType="user"><UserProfile /></ProtectedRoute>} />
              <Route path="/user/settings" element={<ProtectedRoute userType="user"><SettingsPage /></ProtectedRoute>} />
              <Route path="/user/wishlist" element={<ProtectedRoute userType="user"><WishlistPage /></ProtectedRoute>} />
              <Route path="/user/cart" element={<ProtectedRoute userType="user"><Cart /></ProtectedRoute>} />
              <Route path="/user/checkout" element={<ProtectedRoute userType="user"><CheckoutPage /></ProtectedRoute>} />
              <Route path="/user/payment-success/:orderId" element={<ProtectedRoute userType="user"><PurchaseCompleted /></ProtectedRoute>} />
             

              {/* tutor routes */}
              <Route path="/tutor/dashboard" element={<ProtectedRoute userType="tutor"><TutorDashboard /></ProtectedRoute>} />
              <Route path="/tutor/settings" element={<ProtectedRoute userType="tutor"><TutorSettings /></ProtectedRoute>} />
              <Route path="/tutor/create-course" element={<ProtectedRoute userType="tutor"><CourseCreation /></ProtectedRoute>} />
              <Route path="/tutor/myCourses" element={<ProtectedRoute userType="tutor"><TutorCourses/></ProtectedRoute>} />
              <Route path="/tutor/view-course" element={<ProtectedRoute userType="tutor"><TutorViewCourse/></ProtectedRoute>} />
              <Route path="/tutor/edit-course/:id" element={<ProtectedRoute userType="tutor"><TutorEditCourse/></ProtectedRoute>} />

              {/* course routes */}
              <Route path="/all-courses" element={<CourseListing />}></Route>
              <Route path="/course/details/:courseId" element={<CourseDetails />} />


              {/* Catch-all route for undefined paths */}
              <Route path="*" element={<PageNotFound />} />

              {/* Error Page */}
              <Route path="/forbidden" element={<UnauthorizedPage/>} />


            </Routes>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
    
  
  );
}

export default App;
