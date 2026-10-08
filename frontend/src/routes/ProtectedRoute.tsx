import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard
    if (user.role === 'CITIZEN') return <Navigate to="/citizen" replace />;
    if (user.role === 'OFFICER') return <Navigate to="/officer" replace />;
    if (user.role === 'DEPARTMENT_ADMIN') return <Navigate to="/dept-admin" replace />;
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/sys-admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
