import api from './api';

export interface Category {
  id?: number;
  name: string;
  type: 'DEBIT' | 'CREDIT';
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
      const response = await api.get(CATEGORY_ENDPOINTS.BASE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  async getCategoriesByType(type: 'DEBIT' | 'CREDIT'): Promise<Category[]> {
    try {
      const response = await api.get(`${CATEGORY_ENDPOINTS.BY_TYPE}?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${type} categories:`, error);
      throw error;
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category with id ${id}:`, error);
      throw error;
    }
  }

  async createCategory(category: Category): Promise<Category> {
    try {
      const response = await api.post(CATEGORY_ENDPOINTS.CREATE, category);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  async updateCategory(id: number, category: Category): Promise<Category> {
    try {
      const response = await api.put(`${CATEGORY_ENDPOINTS.BASE}/${id}`, category);
      return response.data;
    } catch (error) {
      console.error(`Failed to update category with id ${id}:`, error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`${CATEGORY_ENDPOINTS.BASE}/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Failed to delete category with id ${id}:`, error);
      throw error;
    }
  }
}

export default new CategoryService();
