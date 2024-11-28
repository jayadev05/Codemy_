import { useState } from "react";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Signup from "./components/pages/signup/Signup";
import Login from "./components/pages/login/Login";
import Home from "./components/pages/user/Home";
import store from "../src/store/store";
import Dashboard from "./components/pages/admin/dashboard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import TutorManagement from "./components/pages/admin/tutorManage";
import UserProfile from "./components/pages/user/UserProfile";
import SettingsPage from "./components/pages/user/UserSettings";
import TutorSettings from "./components/pages/tutor/TutorSettings";
import TutorDashboard from "./components/pages/tutor/TutorDashboard";
import PageNotFound from "./components/pages/404";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/signup"
            element={
              <GoogleOAuthProvider clientId="532055856231-5bvv6o4cog4srbvvghv969kfenmd33cl.apps.googleusercontent.com">
                <Signup />
              </GoogleOAuthProvider>
            }
          />
          <Route
            path="/login"
            element={
              <GoogleOAuthProvider clientId="532055856231-5bvv6o4cog4srbvvghv969kfenmd33cl.apps.googleusercontent.com">
                <Login />
              </GoogleOAuthProvider>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/manage-tutor" element={<TutorManagement />} />

            {/* //user routes */}
          <Route path="/user/profile" element={<UserProfile/>} />
          <Route path="/user/settings" element={<SettingsPage/>} />


            {/* tutor routes */}
            <Route path="/tutor/dashboard" element={<TutorDashboard/>} />
            <Route path="/tutor/settings" element={<TutorSettings/>} />

              {/* Catch-all route for undefined paths */}
            <Route path="*" element={<PageNotFound/>} />

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
