import axios from 'axios';

// Create Axios instance with your backend base URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────
// Automatically adds "Authorization: Bearer TOKEN" to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roomzy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────
// Handles token expiry globally — logs out user if 401
api.interceptors.response.use(
  (response) => response,  // Pass through successful responses
  (error) => {
    // Detailed error logging for debugging connectivity issues
    console.group('❌ Roomzy API Error');
    console.error('Message:', error.message);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request sent but no response received. Possible CORS or Network issue.');
      console.error('Base URL:', error.config?.baseURL);
    } else {
      console.error('Error details:', error);
    }
    console.groupEnd();

    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Token expired or invalid — clear everything and redirect to login
      localStorage.removeItem('roomzy_token');
      localStorage.removeItem('roomzy_user');
      window.location.href = '/login';
    }
    // Re-throw the error so individual API calls can catch it too
    return Promise.reject(error);
  }
);


export default api;
