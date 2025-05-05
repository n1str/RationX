import api from './api';

export interface GeneralStatistics {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageTransaction: number;
  largestIncome: number;
  largestExpense: number;
}

export interface CategoryStatistics {
  categoryId: number;
  categoryName: string;
  categoryType: 'DEBIT' | 'CREDIT';
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface PeriodStatistics {
  period: string;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

const STATISTICS_ENDPOINTS = {
  GENERAL: '/statistics',
  BY_CATEGORY: '/statistics/by-category',
  BY_PERIOD: '/statistics/by-period',
  BY_TYPE: '/statistics/by-type',
  LAST_MONTH: '/statistics/last-month',
  LAST_YEAR: '/statistics/last-year',
};

class StatisticsService {
  async getGeneralStatistics(): Promise<GeneralStatistics> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.GENERAL);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch general statistics:', error);
      throw error;
    }
  }

  async getStatisticsByCategory(): Promise<CategoryStatistics[]> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.BY_CATEGORY);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics by category:', error);
      throw error;
    }
  }

  async getStatisticsByPeriod(
    start: string = '', 
    end: string = ''
  ): Promise<PeriodStatistics[]> {
    try {
      const queryParams = start && end ? `?start=${start}&end=${end}` : '';
      const response = await api.get(`${STATISTICS_ENDPOINTS.BY_PERIOD}${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics by period:', error);
      throw error;
    }
  }

  async getStatisticsByType(type: 'DEBIT' | 'CREDIT'): Promise<any> {
    try {
      const response = await api.get(`${STATISTICS_ENDPOINTS.BY_TYPE}?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch statistics for ${type}:`, error);
      throw error;
    }
  }

  async getLastMonthStatistics(): Promise<PeriodStatistics> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_MONTH);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch last month statistics:', error);
      throw error;
    }
  }

  async getLastYearStatistics(): Promise<PeriodStatistics[]> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_YEAR);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch last year statistics:', error);
      throw error;
    }
  }
}

export default new StatisticsService();
