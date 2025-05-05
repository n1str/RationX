import api from './api';

export type PersonType = 'PERSON_TYPE' | 'LEGAL';
export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id?: number;
  // Отправитель
  personType: PersonType;
  name?: string;
  inn: string;
  address?: string;
  phone?: string;
  
  // Получатель
  personTypeRecipient: PersonType;
  nameRecipient?: string;
  innRecipient: string;
  addressRecipient?: string;
  recipientPhoneRecipient?: string;
  
  // Банк отправителя
  nameBank: string;
  bill?: string;
  rBill?: string;
  
  // Банк получателя
  nameBankRecip: string;
  billRecip: string;
  rBillRecip: string;
  
  // Основные данные транзакции
  comment?: string;
  category: string;
  transactionType: TransactionType;
  sum: number;
  typeOperation: TransactionType;
  transactionDate?: string;
  
  // Дополнительные поля для совместимости с формой и другими компонентами
  amount?: number;
  description?: string;
  categoryId?: number;
  type?: TransactionType;
}

const TRANSACTION_ENDPOINTS = {
  BASE: '/api/transactions',
  BY_STATUS: '/api/transactions/status',
  BY_RECIPIENT_INN: '/api/transactions/recipient-inn',
  BY_TYPE: '/api/transactions/type',
  BY_CATEGORY: '/api/transactions/category',
  BY_SENDER_BANK: '/api/transactions/sender-bank',
  BY_RECIPIENT_BANK: '/api/transactions/recipient-bank',
  BY_DATE_RANGE: '/api/transactions/date-range',
  BY_AMOUNT_RANGE: '/api/transactions/amount-range',
};

class TransactionService {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await api.get(TRANSACTION_ENDPOINTS.BASE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }

  async getTransactionsByRecipientInn(inn: string): Promise<Transaction[]> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BY_RECIPIENT_INN}/${inn}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for recipient INN ${inn}:`, error);
      throw error;
    }
  }

  async getTransactionsByType(type: 'DEBIT' | 'CREDIT'): Promise<Transaction[]> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BY_TYPE}?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${type} transactions:`, error);
      throw error;
    }
  }

  async getTransactionsByCategory(categoryId: number): Promise<Transaction[]> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BY_CATEGORY}/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for category ${categoryId}:`, error);
      throw error;
    }
  }

  async getTransactionsBySenderBank(bank: string): Promise<Transaction[]> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BY_SENDER_BANK}/${bank}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for sender bank ${bank}:`, error);
      throw error;
    }
  }

  async getTransactionsByRecipientBank(bank: string): Promise<Transaction[]> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BY_RECIPIENT_BANK}/${bank}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for recipient bank ${bank}:`, error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await api.get(
        `${TRANSACTION_ENDPOINTS.BY_DATE_RANGE}?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions between ${startDate} and ${endDate}:`, error);
      throw error;
    }
  }

  async getTransactionsByAmountRange(minAmount: number, maxAmount: number): Promise<Transaction[]> {
    try {
      const response = await api.get(
        `${TRANSACTION_ENDPOINTS.BY_AMOUNT_RANGE}?minAmount=${minAmount}&maxAmount=${maxAmount}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions between ${minAmount} and ${maxAmount}:`, error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await api.get(`${TRANSACTION_ENDPOINTS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transaction with id ${id}:`, error);
      throw error;
    }
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const response = await api.post(TRANSACTION_ENDPOINTS.BASE, transaction);
      return response.data;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }

  /**
   * Быстрое создание транзакции с минимальными данными
   */
  async createQuickTransaction(
    amount: number, 
    description: string, 
    categoryId: number, 
    type: TransactionType = 'DEBIT'
  ): Promise<Transaction> {
    const transactionDate = new Date().toISOString().split('T')[0];
    
    // Создаем транзакцию с минимально необходимыми полями
    const transaction: Transaction = {
      // Основные данные
      sum: amount,
      comment: description,
      category: categoryId.toString(),
      transactionType: type,
      typeOperation: type,
      transactionDate: transactionDate,
      
      // Обязательные поля отправителя
      personType: 'PERSON_TYPE',
      inn: '000000000000',
      
      // Обязательные поля получателя
      personTypeRecipient: 'PERSON_TYPE',
      innRecipient: '000000000000',
      
      // Обязательные поля банка отправителя
      nameBank: 'Сбербанк',
      bill: '40817810000000000001',
      rBill: '30101810400000000225',
      
      // Обязательные поля банка получателя
      nameBankRecip: 'Сбербанк',
      billRecip: '40817810000000000002',
      rBillRecip: '30101810400000000226',
      
      // Дополнительные поля для совместимости
      amount,
      description,
      categoryId,
      type
    };
    
    // Отправляем на сервер подготовленные данные
    return this.createTransaction(transaction);
  }

  async updateTransaction(id: number, transaction: Transaction): Promise<Transaction> {
    try {
      const response = await api.put(`${TRANSACTION_ENDPOINTS.BASE}/${id}`, transaction);
      return response.data;
    } catch (error) {
      console.error(`Failed to update transaction with id ${id}:`, error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`${TRANSACTION_ENDPOINTS.BASE}/${id}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Failed to delete transaction with id ${id}:`, error);
      throw error;
    }
  }
}

export default new TransactionService();
