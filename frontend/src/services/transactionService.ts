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
  
  // Маппинг полей для совместимости фронтенда и бэкенда
  amount?: number;
  description?: string;
  categoryId?: number;
  type?: TransactionType;
  status?: string;
  recipientName?: string;
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
      const response = await api.get('/api/transactions/get-all-tr');
      console.log('Получены транзакции:', response.data);
      return this._normalizeTransactions(response.data);
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
      // Нормализуем данные перед отправкой на бэкенд
      const transactionForBackend = this._prepareTransactionForBackend(transaction);
      console.log('Отправляем на бэкенд транзакцию:', transactionForBackend);
      const response = await api.post(TRANSACTION_ENDPOINTS.BASE, transactionForBackend);
      return this._normalizeTransactionFromBackend(response.data);
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

  // Приватный метод для нормализации транзакций с бэкенда
  private _normalizeTransactions(transactions: any[]): Transaction[] {
    console.log('Нормализация транзакций, исходные данные:', transactions);
    if (!Array.isArray(transactions)) {
      console.error('Ожидался массив транзакций, получено:', transactions);
      return [];
    }
    const normalized = transactions.map(trans => this._normalizeTransactionFromBackend(trans));
    console.log('Нормализованные транзакции:', normalized);
    return normalized;
  }

  // Преобразует транзакцию с бэкенда в формат для фронтенда
  private _normalizeTransactionFromBackend(transaction: any): Transaction {
    if (!transaction) return {} as Transaction;
    
    // Инвертируем типы транзакций:
    // На бэкенде DEBIT - это расход, а CREDIT - это доход
    // Но на фронтенде нужно отображать наоборот
    let transactionType = transaction.transactionType || transaction.type || transaction.typeOperation;
    
    // Инвертируем тип транзакции
    if (transactionType === 'DEBIT') {
      transactionType = 'CREDIT'; // DEBIT (фактический доход) -> отображаем как CREDIT (доход)
    } else if (transactionType === 'CREDIT') {
      transactionType = 'DEBIT'; // CREDIT (фактический расход) -> отображаем как DEBIT (расход)
    }
    
    // Убедимся, что categoryId есть и в правильном формате
    let categoryId = transaction.categoryId;
    if (transaction.category && !categoryId) {
      // Если есть строковая категория, но нет ID - пробуем преобразовать
      const categoryFromString = parseInt(transaction.category);
      if (!isNaN(categoryFromString)) {
        categoryId = categoryFromString;
      }
    }
    
    // Убедимся, что дата в правильном формате
    let transactionDate = transaction.transactionDate;
    if (!transactionDate) {
      // Если нет даты, установим текущую
      transactionDate = new Date().toISOString();
    }
    
    return {
      ...transaction,
      // Маппим поля для совместимости
      amount: transaction.sum || transaction.amount,
      description: transaction.comment || transaction.description,
      type: transactionType,
      // Обеспечиваем совместимость с интерфейсом Transaction
      personType: transaction.personType || 'PERSON_TYPE',
      inn: transaction.inn || '000000000000',
      personTypeRecipient: transaction.personTypeRecipient || 'PERSON_TYPE',
      innRecipient: transaction.innRecipient || '000000000000',
      nameBank: transaction.nameBank || '',
      nameBankRecip: transaction.nameBankRecip || '',
      billRecip: transaction.billRecip || '',
      rBillRecip: transaction.rBillRecip || '',
      typeOperation: transactionType,
      sum: transaction.sum || transaction.amount || 0,
      // Установим и categoryId и category для совместимости
      categoryId: categoryId || (transaction.category ? parseInt(transaction.category) : undefined),
      category: transaction.category || (categoryId ? categoryId.toString() : ''),
      // Установим дату транзакции
      transactionDate: transactionDate,
    };
  }

  // Подготавливает транзакцию для отправки на бэкенд
  private _prepareTransactionForBackend(transaction: Transaction): any {
    const backendTransaction = { ...transaction };
    
    // Устанавливаем все обязательные поля для бэкенда
    backendTransaction.sum = transaction.amount || transaction.sum;
    backendTransaction.comment = transaction.description || transaction.comment;
    
    // Инвертируем тип транзакции для бэкенда
    if (transaction.type === 'DEBIT') {
      backendTransaction.transactionType = 'CREDIT'; // На фронте DEBIT (расход) -> на бэкенде CREDIT
      backendTransaction.typeOperation = 'CREDIT';
    } else if (transaction.type === 'CREDIT') {
      backendTransaction.transactionType = 'DEBIT'; // На фронте CREDIT (доход) -> на бэкенде DEBIT
      backendTransaction.typeOperation = 'DEBIT';
    }
    
    return backendTransaction;
  }
}

export default new TransactionService();
