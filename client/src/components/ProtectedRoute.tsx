import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-blue-500 text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <p className="text-gray-300 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin only and user is not admin, redirect to dashboard
  if (adminOnly && !user?.is_admin) {
    console.log('User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and passes admin check, render children
  return <>{children}</>;
};

export default ProtectedRoute;
