import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://194.163.135.136:4110/odata/v4'
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'http://192.168.2.155:4004/odata/v4',
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
      if (error.response?.status === 401) {
          message.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/'; // Redirect to login
      }
      return Promise.reject(error);
  }
);

export default api;
