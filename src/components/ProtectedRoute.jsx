import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { user, loading } = useAuth();
  const { admin } = useAuth();

  if (loading) {
    return <div className="page-status">Syncing identity...</div>;
  }

  if (adminOnly && !admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
