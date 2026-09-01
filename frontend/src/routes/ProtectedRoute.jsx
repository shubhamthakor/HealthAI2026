import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper to protect endpoints based on authentication and authorization roles.
 * 
 * @param {string[]} allowedRoles - Roles allowed to access this route (e.g., ['admin', 'doctor'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // 1. Show a loading screen while we verify if a valid session cookie exists
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p className="auth-loading-text">Verifying secure session...</p>
      </div>
    );
  }

  // 2. Redirect to login if user is not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Redirect to unauthorized page if role is not authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Render children views via the react-router Outlet
  return <Outlet />;
};

export default ProtectedRoute;
