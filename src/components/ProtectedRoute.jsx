import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

// Usage:
// <ProtectedRoute allowedRoles={['student']}>  → only students
// <ProtectedRoute allowedRoles={['owner']}>    → only owners
// <ProtectedRoute>                             → any logged-in user

function getStoredUser() {
  try {
    const raw = localStorage.getItem('roomzy_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const storedToken = localStorage.getItem('roomzy_token');
  const hasSession = isAuthenticated || !!storedToken;

  // Not logged in → redirect to login
  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  const effectiveUser = user || getStoredUser();

  // Logged in but wrong role → redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
