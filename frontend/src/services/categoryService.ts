import api from './api';

export interface Category {
  id?: number;
  name: string;
  type: 'DEBIT' | 'CREDIT';
  description?: string;
  iconUrl?: string;
  applicableType?: 'DEBIT' | 'CREDIT';
}

// Интерфейс для отправки данных на бэкенд
interface CategoryDTO {
  nameCategory: string;
  transactionType: 'DEBIT' | 'CREDIT';
  description?: string;
  iconUrl?: string;
}

const CATEGORY_ENDPOINTS = {
  BASE: '/api/categories',
  BY_TYPE: '/api/categories/by-type',
  CREATE: '/api/categories/create',
};

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      console.log('Вызов метода getAllCategories()');
      const response = await api.get(CATEGORY_ENDPOINTS.BASE);
      console.log('Ответ от API категорий:', response.data);
      
      return this._normalizeCategories(response.data);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      throw error;
    }
  }

  async getCategoriesByType(type: 'DEBIT' | 'CREDIT'): Promise<Category[]> {
    try {
      console.log(`Вызов метода getCategoriesByType(${type})`);
      const response = await api.get(`${CATEGORY_ENDPOINTS.BY_TYPE}?type=${type}`);
      console.log(`Ответ от API категорий по типу ${type}:`, response.data);
      
      return this._normalizeCategories(response.data, type);
    } catch (error) {
      console.error(`Ошибка при получении категорий типа ${type}:`, error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      console.log(`Запрос категории по ID ${id}`);
      const response = await api.get(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      console.log(`Получены данные категории:`, response.data);
      
      return this._normalizeCategory(response.data);
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${id}:`, error);
      throw error;
    }
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      // Преобразуем в формат, ожидаемый бэкендом
      const categoryDTO = this._prepareCategoryForBackend(category);
      
      console.log('Отправляем на бэкенд данные категории:', categoryDTO);
      const response = await api.post(CATEGORY_ENDPOINTS.CREATE, categoryDTO);
      console.log('Ответ от бэкенда после создания категории:', response.data);
      
      return this._normalizeCategory(response.data);
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      // Преобразуем в формат, ожидаемый бэкендом
      const categoryDTO = this._prepareCategoryForBackend(category);
      
      console.log(`Отправляем на бэкенд данные обновления категории ID=${id}:`, categoryDTO);
      const response = await api.put(`${CATEGORY_ENDPOINTS.BASE}/${id}`, categoryDTO);
      console.log('Ответ от бэкенда после обновления категории:', response.data);
      
      return this._normalizeCategory(response.data);
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      console.log(`Удаляем категорию с ID ${id}`);
      const response = await api.delete(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      console.log('Ответ от бэкенда:', response.status);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${id}:`, error);
      throw error;
    }
  }

  // Приватные методы для обработки данных

  /**
   * Нормализует массив категорий от бэкенда
   */
  private _normalizeCategories(categories: any[], defaultType?: 'DEBIT' | 'CREDIT'): Category[] {
    return categories.map(cat => this._normalizeCategory(cat, defaultType));
  }

  /**
   * Нормализует одну категорию от бэкенда
   */
  private _normalizeCategory(backendCategory: any, defaultType?: 'DEBIT' | 'CREDIT'): Category {
    return {
      id: backendCategory.id,
      name: backendCategory.name || backendCategory.nameCategory || '',
      type: backendCategory.type || backendCategory.transactionType || backendCategory.applicableType || defaultType || 'DEBIT',
      description: backendCategory.description || '',
      iconUrl: backendCategory.iconUrl || ''
    };
  }

  /**
   * Подготавливает категорию для отправки на бэкенд
   */
  private _prepareCategoryForBackend(category: Category): CategoryDTO {
    return {
      nameCategory: category.name,
      transactionType: category.type,
      description: category.description,
      iconUrl: category.iconUrl
    };
  }
}

export default new CategoryService();
