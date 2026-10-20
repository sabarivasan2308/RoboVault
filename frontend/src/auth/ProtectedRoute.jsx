import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Authenticating laboratory session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '60px' }}>
        <h2 style={{ color: '#ef4444' }}>403 — Access Denied</h2>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>
          Your account role (<strong style={{ color: '#38bdf8' }}>{user?.role}</strong>) does not have authorization to view this resource.
        </p>
      </div>
    );
  }

  return children;
};
