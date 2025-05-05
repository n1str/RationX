import transactionService from './transactionService';

/**
 * Прямое создание транзакции на бэкенде
 * Использует минимально необходимый набор данных
 */
export async function createDirectTransaction(
  amount: number, 
  description: string, 
  categoryId: number, 
  type: 'DEBIT' | 'CREDIT' = 'DEBIT'
) {
  return transactionService.createQuickTransaction(amount, description, categoryId, type);
} 
