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
      
      // Нормализуем данные от бэкенда
      return this._normalizeGeneralStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch general statistics:', error);
      console.log('StatisticsService: возвращаем заглушку вместо данных с сервера');
      return FALLBACK_GENERAL_STATISTICS;
    }
  }

  async getStatisticsByCategory(): Promise<CategoryStatistics[]> {
    try {
      console.log('StatisticsService: запрос статистики по категориям...');
      const response = await api.get(STATISTICS_ENDPOINTS.BY_CATEGORY);
      console.log('StatisticsService: получена статистика по категориям:', response.data);
      
      // Преобразуем данные от бэкенда в нужный формат
      return this._normalizeCategoryStatistics(response.data);
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
      console.log(`StatisticsService: запрос статистики по периоду (${start} - ${end})...`);
      const queryParams = start && end ? `?start=${start}&end=${end}` : '';
      const response = await api.get(`${STATISTICS_ENDPOINTS.BY_PERIOD}${queryParams}`);
      console.log('StatisticsService: получена статистика по периоду:', response.data);
      
      // Преобразуем данные от бэкенда в нужный формат
      return this._normalizePeriodStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics by period:', error);
      return [];
    }
  }

  async getStatisticsByType(type: 'DEBIT' | 'CREDIT'): Promise<any> {
    try {
      console.log(`StatisticsService: запрос статистики по типу ${type}...`);
      const response = await api.get(`${STATISTICS_ENDPOINTS.BY_TYPE}?type=${type}`);
      console.log('StatisticsService: получена статистика по типу:', response.data);
      
      // Возвращаем данные как есть, так как они уже должны быть в правильном формате
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch statistics for ${type}:`, error);
      return {};
    }
  }

  async getLastMonthStatistics(): Promise<PeriodStatistics> {
    try {
      console.log('StatisticsService: запрос статистики за последний месяц...');
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_MONTH);
      console.log('StatisticsService: получена статистика за последний месяц:', response.data);
      
      // Преобразуем данные от бэкенда в нужный формат
      return this._normalizeSinglePeriodStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch last month statistics:', error);
      return FALLBACK_PERIOD_STATISTICS;
    }
  }

  async getLastYearStatistics(): Promise<PeriodStatistics[]> {
    try {
      console.log('StatisticsService: запрос статистики за последний год...');
      const response = await api.get(STATISTICS_ENDPOINTS.LAST_YEAR);
      console.log('StatisticsService: получена статистика за последний год:', response.data);
      
      // Преобразуем данные от бэкенда в нужный формат
      return this._normalizePeriodStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch last year statistics:', error);
      return [FALLBACK_PERIOD_STATISTICS];
    }
  }
  
  // Приватные методы для нормализации данных
  
  private _normalizeGeneralStatistics(data: any): GeneralStatistics {
    if (!data) return FALLBACK_GENERAL_STATISTICS;
    
    // Инвертируем доходы и расходы, т.к. на бэкенде они считаются наоборот totalIncome totalExpense
    const totalIncome = data.totalIncome || data.expenses || 0;
    const totalExpenses = data.totalExpense || data.income || 0;
    const balance = totalIncome - totalExpenses;
    
    console.log('Исходные данные статистики:', data);
    console.log('Скорректированные данные:', {
      totalIncome,
      totalExpenses,
      balance
    });
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: data.transactionCount || data.transactions || 0,
      averageTransaction: data.averageTransaction || data.average || 0,
      largestIncome: data.largestExpense || data.maxExpense || 0,
      largestExpense: data.largestIncome || data.maxIncome || 0
    };
  }
  
  private _normalizeCategoryStatistics(data: any): CategoryStatistics[] {
    if (!data || !Array.isArray(data)) return [];
    
    // Если данные пришли в неожиданном формате (объект вместо массива)
    if (!Array.isArray(data) && typeof data === 'object') {
      const result: CategoryStatistics[] = [];
      
      // Преобразуем объект в массив объектов CategoryStatistics
      Object.entries(data).forEach(([categoryName, stats]: [string, any]) => {
        result.push({
          categoryId: stats.id || 0,
          categoryName: categoryName,
          categoryType: stats.type || 'DEBIT',
          amount: stats.amount || stats.sum || 0,
          percentage: stats.percentage || 0,
          transactionCount: stats.count || 0
        });
      });
      
      return result;
    }
    
    // Если данные пришли как массив объектов
    return data.map((category: any) => ({
      categoryId: category.categoryId || category.id || 0,
      categoryName: category.categoryName || category.name || '',
      categoryType: category.categoryType || category.type || 'DEBIT',
      amount: category.amount || category.sum || 0,
      percentage: category.percentage || 0,
      transactionCount: category.transactionCount || category.count || 0
    }));
  }
  
  private _normalizePeriodStatistics(data: any): PeriodStatistics[] {
    if (!data) return [FALLBACK_PERIOD_STATISTICS];
    
    // Если данные пришли как один объект (не массив)
    if (!Array.isArray(data)) {
      return [this._normalizeSinglePeriodStatistics(data)];
    }
    
    // Если данные пришли как массив
    return data.map(this._normalizeSinglePeriodStatistics);
  }
  
  private _normalizeSinglePeriodStatistics(period: any): PeriodStatistics {
    if (!period) return FALLBACK_PERIOD_STATISTICS;
    
    return {
      period: period.period || new Date().toISOString(),
      income: period.income || period.totalIncome || 0,
      expenses: period.expenses || period.totalExpense || 0,
      balance: period.balance || 0,
      transactionCount: period.transactionCount || period.count || 0
    };
  }
}

export default new StatisticsService();
