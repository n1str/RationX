import api from './api';
import { jwtDecode } from 'jwt-decode';
import safeStorage from '../utils/storage';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user?: {
    id: number;
    username: string;
  };
  // Возможные альтернативные поля в ответе
  id?: number;
  username?: string;
}

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VALIDATE: '/api/auth/validate',
};

class AuthService {
  async login(credentials: LoginRequest): Promise<boolean> {
    try {
      const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      
      if (response.data && response.data.token) {
        // Сохраняем токен в localStorage напрямую для совместимости с interceptors
        localStorage.setItem('token', response.data.token);
        
        // Используем SafeStorage для надежного хранения данных пользователя
        const userData = {
          id: response.data.id || response.data.user?.id,
          username: response.data.username || response.data.user?.username
        };
        
        safeStorage.set('user', userData, { ttl: 24 * 60 * 60 * 1000 }); // Срок действия 24 часа
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<boolean> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
      return response.status === 201 || response.status === 200;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    safeStorage.remove('user');
  }

  getCurrentUser(): any {
    return safeStorage.get('user');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (decoded.exp < currentTime) {
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.VALIDATE, token);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();
