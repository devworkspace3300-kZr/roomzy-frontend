import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

// Usage:
// <ProtectedRoute allowedRoles={['student']}>  → only students
// <ProtectedRoute allowedRoles={['owner']}>    → only owners
// <ProtectedRoute>                             → any logged-in user

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
