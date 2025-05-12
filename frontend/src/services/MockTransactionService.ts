import { v4 as uuidv4 } from 'uuid';

// Моковые данные для тестирования
export const getMockTransactions = () => {
  return [
    {
      id: 1,
      status: 'NEW',
      dateTime: new Date().toISOString(),
      comment: "Тестовый платеж за товар",
      
      // Детальная информация о транзакции
      regTransaction: {
        id: 101,
        transactionType: 'DEBIT', // Расход
        sum: 15000,
        date: new Date().toISOString()
      },
      
      // Категория
      category: {
        id: 1,
        name: "Покупки",
        applicableType: "DEBIT"
      },
      
      // Отправитель
      subjectSender: {
        id: 201,
        name: "Иванов Иван Иванович",
        inn: "123456789012",
        address: "г. Москва, ул. Ленина 10, кв. 5",
        recipientPhone: "+79001234567",
        personType: "PERSON_TYPE" // Физическое лицо
      },
      
      // Получатель
      subjectGetter: {
        id: 202,
        name: "ООО Компания",
        inn: "1234567890",
        address: "г. Санкт-Петербург, пр. Невский 100, офис 505",
        recipientPhone: "+78123456789",
        personType: "LEGAL_TYPE" // Юридическое лицо
      },
      
      // Банк отправителя
      senderBank: {
        id: 301,
        nameBank: "Сбербанк",
        bill: "40817810000000030002",
        rbill: "30101810400000000225"
      },
      
      // Банк получателя
      recipientBank: {
        id: 302,
        nameBank: "Альфа-Банк",
        bill: "40702810000000000123",
        rbill: "30101810200000000593"
      }
    },
    {
      id: 2,
      status: 'PAYMENT_COMPLETED',
      dateTime: new Date(Date.now() - 86400000).toISOString(), // Вчера
      comment: "Зарплата за апрель",
      
      // Детальная информация о транзакции
      regTransaction: {
        id: 102,
        transactionType: 'CREDIT', // Доход
        sum: 75000,
        date: new Date(Date.now() - 86400000).toISOString()
      },
      
      // Категория
      category: {
        id: 2,
        name: "Доходы",
        applicableType: "CREDIT"
      },
      
      // Отправитель (работодатель)
      subjectSender: {
        id: 203,
        name: "ООО Работодатель",
        inn: "7707083893",
        address: "г. Москва, ул. Вавилова 19",
        recipientPhone: "+74957574747",
        personType: "LEGAL_TYPE" // Юридическое лицо
      },
      
      // Получатель (сотрудник)
      subjectGetter: {
        id: 204,
        name: "Петров Петр Петрович",
        inn: "123456789013",
        address: "г. Москва, ул. Пушкина 15, кв. 10",
        recipientPhone: "+79009876543",
        personType: "PERSON_TYPE" // Физическое лицо
      },
      
      // Банк отправителя (работодателя)
      senderBank: {
        id: 303,
        nameBank: "ВТБ",
        bill: "40702810000000001234",
        rbill: "30101810700000000187"
      },
      
      // Банк получателя (сотрудника)
      recipientBank: {
        id: 304,
        nameBank: "Тинькофф Банк",
        bill: "40817810000000040001",
        rbill: "30101810145250000974"
      }
    }
  ];
};

// Получить транзакцию по ID
export const getMockTransactionById = (id: number) => {
  const transactions = getMockTransactions();
  return transactions.find(t => t.id === id);
};

// Генерировать случайную транзакцию
export const generateRandomTransaction = (id: number = Math.floor(Math.random() * 1000)) => {
  const transactionType = Math.random() > 0.5 ? 'CREDIT' : 'DEBIT';
  const isCompany = Math.random() > 0.5;
  
  return {
    id: id,
    status: ['NEW', 'PAYMENT_COMPLETED', 'PROCESSING'][Math.floor(Math.random() * 3)],
    dateTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    comment: `Транзакция #${id}`,
    
    // Детальная информация о транзакции
    regTransaction: {
      id: id + 1000,
      transactionType: transactionType,
      sum: Math.floor(Math.random() * 100000),
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString()
    },
    
    // Категория
    category: {
      id: Math.floor(Math.random() * 10),
      name: transactionType === 'CREDIT' ? 
        ["Зарплата", "Доходы", "Инвестиции", "Подарки"][Math.floor(Math.random() * 4)] : 
        ["Продукты", "Транспорт", "Развлечения", "ЖКХ"][Math.floor(Math.random() * 4)],
      applicableType: transactionType
    },
    
    // Отправитель
    subjectSender: {
      id: id + 2000,
      name: isCompany ? `ООО Компания ${id}` : `Иванов Иван ${id}`,
      inn: isCompany ? "1234567890" : "123456789012",
      address: `г. Москва, ул. Тестовая ${id}`,
      recipientPhone: `+7900${Math.floor(Math.random() * 10000000)}`,
      personType: isCompany ? "LEGAL_TYPE" : "PERSON_TYPE"
    },
    
    // Получатель
    subjectGetter: {
      id: id + 3000,
      name: !isCompany ? `ООО Получатель ${id}` : `Петров Петр ${id}`,
      inn: !isCompany ? "0987654321" : "210987654321",
      address: `г. Санкт-Петербург, пр. Тестовый ${id}`,
      recipientPhone: `+7911${Math.floor(Math.random() * 10000000)}`,
      personType: !isCompany ? "LEGAL_TYPE" : "PERSON_TYPE"
    },
    
    // Банк отправителя
    senderBank: {
      id: id + 4000,
      nameBank: ["Сбербанк", "ВТБ", "Альфа-Банк", "Тинькофф"][Math.floor(Math.random() * 4)],
      bill: `4081781000000${Math.floor(Math.random() * 10000000)}`,
      rbill: `3010181${Math.floor(Math.random() * 10000000000)}`
    },
    
    // Банк получателя
    recipientBank: {
      id: id + 5000,
      nameBank: ["Газпромбанк", "Райффайзенбанк", "Открытие", "Россельхозбанк"][Math.floor(Math.random() * 4)],
      bill: `4070281000000${Math.floor(Math.random() * 10000000)}`,
      rbill: `3010181${Math.floor(Math.random() * 10000000000)}`
    }
  };
};

export default {
  getMockTransactions,
  getMockTransactionById,
  generateRandomTransaction
}; 