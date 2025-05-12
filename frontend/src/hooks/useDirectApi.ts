// @ts-ignore
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getMockTransactionById, getMockTransactions } from '../services/MockTransactionService';

interface FetchOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  useMockOnFailure?: boolean;
}

// Хук для прямого доступа к API
export const useDirectApi = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  // Функция для выполнения запроса
  const fetchData = useCallback(async (options: FetchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      const method = options.method || 'GET';
      
      if (method === 'GET') {
        response = await api.get(options.url, { headers: options.headers });
      } else if (method === 'POST') {
        response = await api.post(options.url, options.body, { headers: options.headers });
      } else if (method === 'PUT') {
        response = await api.put(options.url, options.body, { headers: options.headers });
      } else if (method === 'DELETE') {
        response = await api.delete(options.url, { headers: options.headers });
      }
      
      if (response && response.data) {
        // Используем данные напрямую без обработки
        setData(response.data);
        return response.data;
      } else {
        throw new Error('Пустой ответ от сервера');
      }
    } catch (err: any) {
      console.error('Ошибка при запросе к API:', err);
      setError(err.message || 'Неизвестная ошибка');
      
      // Если указано использовать мок-данные при ошибке, и произошла ошибка
      if (options.useMockOnFailure) {
        setUseMockData(true);
        
        // Определяем, какие тестовые данные нужны на основе URL
        if (options.url.includes('/transactions/')) {
          const idMatch = options.url.match(/\/transactions\/(\d+)/);
          if (idMatch && idMatch[1]) {
            const id = parseInt(idMatch[1]);
            const mockData = getMockTransactionById(id);
            setData(mockData);
            return mockData;
          }
        } else if (options.url.includes('/transactions')) {
          const mockData = getMockTransactions();
          setData(mockData);
          return mockData;
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получить все транзакции
  const fetchAllTransactions = useCallback(async () => {
    try {
      // Сначала пробуем получить через стандартный метод API
      const allTransactions = await fetchData({ url: '/api/transactions', useMockOnFailure: true });
      return allTransactions;
    } catch (err) {
      console.error('Ошибка при получении всех транзакций:', err);
      
      // Если стандартный метод не работает, пробуем через get-all-tr
      try {
        const liteTransactions = await fetchData({ url: '/api/transactions/get-all-tr', useMockOnFailure: true });
        return liteTransactions;
      } catch (liteErr) {
        console.error('Ошибка при получении транзакций через get-all-tr:', liteErr);
        
        // Если все API запросы не сработали, возвращаем мок-данные
        const mockTransactions = getMockTransactions();
        return mockTransactions;
      }
    }
  }, [fetchData]);
  
  // Найти транзакцию в списке по ID
  const findTransactionInList = useCallback(async (id: number) => {
    try {
      // Сначала пробуем получить все транзакции
      const allTransactions = await fetchAllTransactions();
      
      if (Array.isArray(allTransactions)) {
        // Ищем транзакцию с указанным ID
        const foundTransaction = allTransactions.find((t: any) => t.id === id);
        
        if (foundTransaction) {
          // Данные используем напрямую без обработки
          setData(foundTransaction);
          return foundTransaction;
        }
      }
      
      // Если не удалось найти в списке, возвращаем тестовую транзакцию
      if (useMockData) {
        const mockTransaction = getMockTransactionById(id);
        if (mockTransaction) {
          setData(mockTransaction);
          return mockTransaction;
        }
      }
      
      // Если не удалось найти в списке, возвращаем null
      return null;
    } catch (err) {
      console.error('Ошибка при поиске транзакции в списке:', err);
      
      // При ошибке пробуем использовать тестовые данные
      if (useMockData) {
        const mockTransaction = getMockTransactionById(id);
        if (mockTransaction) {
          setData(mockTransaction);
          return mockTransaction;
        }
      }
      
      return null;
    }
  }, [fetchAllTransactions, useMockData]);

  // Специальная функция для получения транзакции по ID с обработкой данных
  const fetchTransactionById = useCallback(async (id: number) => {
    try {
      // Прямой запрос по ID
      const transaction = await fetchData({ 
        url: `/api/transactions/${id}`, 
        useMockOnFailure: true 
      });
      
      if (transaction) {
        // Устанавливаем данные напрямую без обработки
        setData(transaction);
        return transaction;
      }
    } catch (err) {
      console.error(`Ошибка при получении транзакции по ID ${id}:`, err);
    }
    
    // Если прямой запрос не удался, пробуем найти в списке
    try {
      const transactionFromList = await findTransactionInList(id);
      if (transactionFromList) {
        return transactionFromList;
      }
    } catch (listErr) {
      console.error('Ошибка при поиске в списке:', listErr);
    }
    
    // Если все API методы не удались, используем тестовые данные
    const mockTransaction = getMockTransactionById(id);
    if (mockTransaction) {
      setData(mockTransaction);
      return mockTransaction;
    }
    
    // Если все способы не удались
    console.error(`Не удалось получить транзакцию с ID ${id} ни одним способом`);
    return null;
  }, [fetchData, findTransactionInList]);

  return {
    data,
    loading,
    error,
    fetchData,
    fetchTransactionById,
    fetchAllTransactions,
    findTransactionInList
  };
};

export default useDirectApi; 