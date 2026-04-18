import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RBACGuardProps {
  allowedRoles?: string[];
}

export const RBACGuard: React.FC<RBACGuardProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasClearance = allowedRoles.includes(user.role);
    if (!hasClearance) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
