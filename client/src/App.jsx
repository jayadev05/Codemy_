
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Home from "./components/pages/user/Home";
import { store, persistor } from "../src/store/store";
import Dashboard from "./components/pages/admin/AdminDashboard";
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from "@react-oauth/google";
import TutorManagement from "./components/pages/admin/tutorManage";
import UserProfile from "./components/pages/user/UserProfile";
import SettingsPage from "./components/pages/user/UserSettings";
import TutorSettings from "./components/pages/tutor/TutorSettings";
import TutorDashboard from "./components/pages/tutor/TutorDashboard";
import PageNotFound from "./components/pages/general/404";
import StudentManagement from "./components/pages/admin/studentManage";
import SignUp from './components/pages/general/signup/Signup'
import Login from './components/pages/general/login/Login'
import ResetPassword from "./components/pages/general/PasswordReset";
import ForgotPassword from "./components/pages/general/ForgotPassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    

    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId="532055856231-5bvv6o4cog4srbvvghv969kfenmd33cl.apps.googleusercontent.com">
          <ToastContainer/>
          <BrowserRouter>
            <Routes>

              {/* generic routes */}
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/login" element={<Login/>} />
              <Route path="/" element={<Home/>} />
              <Route path="/reset-password/:token" element={<ResetPassword/>} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />


              {/* admin routes */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/manage-tutors" element={<TutorManagement />} />
              <Route path="/admin/manage-students" element={<StudentManagement/>} />

              {/* //user routes */}
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/settings" element={<SettingsPage />} />

              {/* tutor routes */}
              <Route path="/tutor/dashboard" element={<TutorDashboard />} />
              <Route path="/tutor/settings" element={<TutorSettings />} />

              {/* Catch-all route for undefined paths */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
    
  
  );
}

export default App;
