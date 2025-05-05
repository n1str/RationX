import axios from 'axios';

// Удаляем префикс '/api' так как он добавляется в URL эндпоинтов auth
const API_URL = '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Для отладки: выводим подробную информацию об ошибке
    console.log('API Error:', error);
    console.log('Response Data:', error.response?.data);
    console.log('Response Status:', error.response?.status);
    
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login if token has expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
