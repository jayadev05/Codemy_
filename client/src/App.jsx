import { useState } from "react";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import Signup from "./components/pages/signup/Signup";
import Login from "./components/pages/login/Login";
import Home from "./components/pages/user/Home";
import store from "../src/redux/store";
import Dashboard from "./components/pages/admin/dashboard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import TutorManagement from "./components/pages/admin/tutorManage";
import UserProfile from "./components/pages/user/UserProfile";
import SettingsPage from "./components/pages/user/UserSettings";

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


          <Route path="/user/profile" element={<UserProfile/>} />
          <Route path="/user/settings" element={<SettingsPage/>} />


        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
