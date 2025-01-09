import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import { selectTutor } from "../../store/slices/tutorSlice";
import { selectAdmin } from "../../store/slices/adminSlice";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, userType, isLoginPage = false }) {
  const user = useSelector(selectUser);
  const tutor = useSelector(selectTutor);
  const admin = useSelector(selectAdmin);

  const activeUser = admin ? "admin" : user ? "user" : tutor ? "tutor" : null;

  const token = localStorage.getItem("accessToken");

  //  If the route is for the login page and a user is already authenticated, redirect them
  if (isLoginPage && activeUser && token) {
    return (
      <Navigate
        to={activeUser !== "user" ? `/${activeUser}/dashboard` : `/`}
        replace
      />
    );
  }

  // Redirect to login if no user is authenticated and this is a protected route
  if (!activeUser && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to forbidden page if user type doesn't match
  if (userType && userType !== activeUser) {
    return <Navigate to="/forbidden" replace />;
  }

  // Render children if the user is authenticated and authorized
  return children;
}

export default ProtectedRoute;
