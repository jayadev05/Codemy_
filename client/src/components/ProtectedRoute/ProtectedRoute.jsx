import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/userSlice';
import { selectTutor } from '../../store/tutorSlice';
import { selectAdmin } from '../../store/adminSlice';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
  const user = useSelector(selectUser);
  const tutor = useSelector(selectTutor);
  const admin = useSelector(selectAdmin);

  const activeUser = admin ? "admin" : (user ? "user" : (tutor ? "tutor" : null));

  console.log("usertype",activeUser);

  // Redirect to login if no user is authenticated
  if (!activeUser) {
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
