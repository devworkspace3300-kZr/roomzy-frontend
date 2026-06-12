import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

// Provider component — wrap your App in this
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token
  const navigate = useNavigate();

  // ── On app load: restore session from localStorage ──────────
  useEffect(() => {
    const storedToken = localStorage.getItem('roomzy_token');
    const storedUser  = localStorage.getItem('roomzy_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Auto refresh user details on mount to sync profile/gender
        api.get('/auth/me')
          .then(res => {
            const data = res.data;
            if (data.success && data.data) {
              setUser(data.data);
              localStorage.setItem('roomzy_user', JSON.stringify(data.data));
            }
          })
          .catch(err => console.error('Auto refresh failed on mount:', err));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem('roomzy_token');
        localStorage.removeItem('roomzy_user');
      }
    }
    setLoading(false);
  }, []);

  // ── Login: save token + user to state AND localStorage ───────
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('roomzy_token', tokenValue);
    localStorage.setItem('roomzy_user', JSON.stringify(userData));
  };

  // ── Logout: clear everything ──────────────────────────────────
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('roomzy_token');
    localStorage.removeItem('roomzy_user');
    navigate('/login');
  };

  // ── Update local user state immediately ───────────────────────
  const updateUser = (data) => {
    const newUser = { ...user, ...data };
    setUser(newUser);
    localStorage.setItem('roomzy_user', JSON.stringify(newUser));
  };

  // ── Refresh: fetch latest user data from backend ──────────────
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      if (data.success) {
        setUser(data.data);
        localStorage.setItem('roomzy_user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // ── Computed helpers ──────────────────────────────────────────
  const isAuthenticated = !!token || !!localStorage.getItem('roomzy_token');
  const isStudent       = user?.role === 'student';
  const isOwner         = user?.role === 'owner';
  const isAdmin         = user?.role === 'admin';
  const verificationStatus = user?.verificationStatus || 'pending';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    isStudent,
    isOwner,
    isAdmin,
    updateUser,
    verificationStatus,
  };

  // Don't render children until we know auth state
  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
