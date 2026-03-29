import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { isPlatformAdmin } from '../services/firebaseService';

interface AdminRouteProps {
  children: React.ReactNode;
}

/** Only `ADMIN` or `SUPER_ADMIN` (see Firestore `users/{uid}.role`). */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isPlatformAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
