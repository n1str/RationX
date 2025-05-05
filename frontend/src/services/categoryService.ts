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
      
      const normalizedCategories = response.data.map((cat: Category) => {
        if (cat.applicableType && !cat.type) {
          return { ...cat, type: cat.applicableType };
        }
        return cat;
      });
      
      return normalizedCategories;
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
      
      const normalizedCategories = response.data.map((cat: Category) => {
        if (cat.applicableType && !cat.type) {
          return { ...cat, type: cat.applicableType };
        } else if (!cat.type) {
          return { ...cat, type };
        }
        return cat;
      });
      
      return normalizedCategories;
    } catch (error) {
      console.error(`Ошибка при получении категорий типа ${type}:`, error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      
      // Нормализуем данные из бэкенда
      const result = response.data;
      const normalizedCategory: Category = {
        id: result.id,
        name: result.name || result.nameCategory || '',
        type: result.type || result.applicableType || 'DEBIT',
        description: result.description,
        iconUrl: result.iconUrl
      };
      
      return normalizedCategory;
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${id}:`, error);
      throw error;
    }
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      // Преобразуем в формат, ожидаемый бэкендом
      const categoryDTO: CategoryDTO = {
        nameCategory: category.name,
        transactionType: category.type,
        description: category.description,
        iconUrl: category.iconUrl
      };
      
      console.log('Отправляем на бэкенд данные категории:', categoryDTO);
      const response = await api.post(CATEGORY_ENDPOINTS.CREATE, categoryDTO);
      
      // Преобразуем обратно в формат Category
      const result = response.data;
      const normalizedCategory: Category = {
        id: result.id,
        name: result.name || '',
        type: result.applicableType || 'DEBIT',
        description: result.description,
        iconUrl: result.iconUrl
      };
      
      return normalizedCategory;
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      // Преобразуем в формат, ожидаемый бэкендом
      const categoryDTO: CategoryDTO = {
        nameCategory: category.name,
        transactionType: category.type,
        description: category.description,
        iconUrl: category.iconUrl
      };
      
      console.log(`Отправляем на бэкенд данные обновления категории ID=${id}:`, categoryDTO);
      const response = await api.put(`${CATEGORY_ENDPOINTS.BASE}/${id}`, categoryDTO);
      
      // Преобразуем обратно в формат Category
      const result = response.data;
      const normalizedCategory: Category = {
        id: result.id,
        name: result.name || '',
        type: result.applicableType || 'DEBIT',
        description: result.description,
        iconUrl: result.iconUrl
      };
      
      return normalizedCategory;
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${id}:`, error);
      throw error;
    }
  }
}

export default new CategoryService();
