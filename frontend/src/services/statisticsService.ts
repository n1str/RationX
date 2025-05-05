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

// Заглушки данных на случай проблем с API
const FALLBACK_GENERAL_STATISTICS: GeneralStatistics = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  transactionCount: 0,
  averageTransaction: 0,
  largestIncome: 0,
  largestExpense: 0
};

const FALLBACK_PERIOD_STATISTICS: PeriodStatistics = {
  period: new Date().toISOString(),
  income: 0,
  expenses: 0,
  balance: 0,
  transactionCount: 0
};

const STATISTICS_ENDPOINTS = {
  GENERAL: '/api/statistics',
  BY_CATEGORY: '/api/statistics/by-category',
  BY_PERIOD: '/api/statistics/by-period',
  BY_TYPE: '/api/statistics/by-type',
  LAST_MONTH: '/api/statistics/last-month',
  LAST_YEAR: '/api/statistics/last-year',
};

class StatisticsService {
  async getGeneralStatistics(): Promise<GeneralStatistics> {
    try {
      console.log('StatisticsService: запрос общей статистики...');
      const response = await api.get(STATISTICS_ENDPOINTS.GENERAL);
      console.log('StatisticsService: получена общая статистика:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch general statistics:', error);
      console.log('StatisticsService: возвращаем заглушку вместо данных с сервера');
      return FALLBACK_GENERAL_STATISTICS;
    }
  }

  async getStatisticsByCategory(): Promise<CategoryStatistics[]> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.BY_CATEGORY);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics by category:', error);
      return [];
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
      return [];
    }
  }

  async getStatisticsByType(type: 'DEBIT' | 'CREDIT'): Promise<any> {
    try {
      const response = await api.get(`${STATISTICS_ENDPOINTS.BY_TYPE}?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch statistics for ${type}:`, error);
      return {};
    }
  }

  async getLastMonthStatistics(): Promise<PeriodStatistics> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_MONTH);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch last month statistics:', error);
      return FALLBACK_PERIOD_STATISTICS;
    }
  }

  async getLastYearStatistics(): Promise<PeriodStatistics[]> {
    try {
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_YEAR);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch last year statistics:', error);
      return [FALLBACK_PERIOD_STATISTICS];
    }
  }
}

export default new StatisticsService();
