import axios from 'axios';
import { APP_CONFIG } from '../config';

const api = axios.create({
    baseURL: APP_CONFIG.apiBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token when available
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

// Response interceptor — handle common errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('roomzy_token');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
