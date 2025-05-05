import axios from 'axios';

// Определяем BASE_URL в зависимости от окружения
let BASE_URL = '';

// В Docker и на локальной машине используем правильные URL
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // На локальной машине
  BASE_URL = 'http://localhost:8080';
} else {
  // В Docker контейнере - используем абсолютный URL до backend
  BASE_URL = 'http://backend:8080';
}

// Добавляем явную проверку URL окружения
console.log('API BASE URL:', BASE_URL, 'Hostname:', window.location.hostname);
console.log('Режим работы:', window.location.hostname === 'localhost' ? 'Локальный режим' : 'Docker режим');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Разрешаем отправку cookies в кросс-доменных запросах
  timeout: 10000 // 10 секунд таймаут
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
