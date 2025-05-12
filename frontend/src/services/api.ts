import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Устанавливаем обработчик для показа ошибок в консоли
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error);
});

// Определяем BASE_URL в зависимости от окружения
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// Используем текущий хост для определения API URL
// Если мы обращаемся к приложению извне Docker, используем тот же хост с портом 8080 
let BASE_URL = isLocalhost 
  ? 'http://localhost:8080' 
  : `http://${hostname}:8080`;

// Для отладки
console.log('API BASE URL:', BASE_URL, 'Hostname:', hostname);
console.log('Полный URL:', window.location.href);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Отключаем credentials для улучшения CORS
  timeout: 15000 // Увеличен таймаут до 15 секунд для более надежной работы
});

// Request interceptor для добавления auth token к запросам
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логирование запросов для отладки
    console.log(`API REQUEST: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок и истечения токена
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логирование успешного ответа для отладки
    console.log(`API RESPONSE: ${response.status} ${response.config.url}`, 
      response.data ? (typeof response.data === 'object' ? 'Data received' : response.data) : '');
    return response;
  },
  async (error: AxiosError) => {
    // Подробная информация об ошибке для отладки
    console.error('API Error:', error.message);
    console.error('Response Data:', error.response?.data);
    console.error('Response Status:', error.response?.status);
    console.error('Request URL:', error.config?.url);
    
    const originalRequest = error.config;
    
    // Обработка истечения токена
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Перенаправляем на логин при истечении токена
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Сессия истекла. Пожалуйста, войдите снова.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
