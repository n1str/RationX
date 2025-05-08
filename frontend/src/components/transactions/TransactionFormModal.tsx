import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Stack,
  Box,
  Typography,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Chip,
  Divider,
  SelectChangeEvent,
  Tabs,
  Tab,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Close,
  ArrowBack,
  Add,
  Save,
  TrendingUp,
  TrendingDown,
  Category as CategoryIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { 
  createTransaction, 
  updateTransaction, 
  fetchTransactionById,
  clearSelectedTransaction,
  fetchAllTransactions
} from '../../store/slices/transactionsSlice';
import { 
  fetchAllCategories,
  fetchCategoriesByType
} from '../../store/slices/categoriesSlice';
import { Transaction, TransactionType, PersonType } from '../../services/transactionService';
import { Category } from '../../services/categoryService';

// Объявляем константы для PersonType чтобы избежать ошибок со строковыми литералами
const PERSON_TYPE: PersonType = 'PERSON_TYPE';
const LEGAL_TYPE: PersonType = 'LEGAL';

// Создаем специальный интерфейс для нашей формы
interface TransactionFormData {
  id?: number;
  
  // Отправитель (соответствует полям в TransactionDTO)
  personType: PersonType;
  name?: string;
  inn: string;
  address?: string;
  phone?: string;
  
  // Получатель (соответствует полям в TransactionDTO)
  personTypeRecipient: PersonType;
  nameRecipient?: string;
  innRecipient: string;
  addressRecipient?: string;
  phoneRecipient?: string;
  
  // Банк отправителя (соответствует полям в API)
  nameBankSender: string;
  billSender?: string;
  rbillSender?: string;
  
  // Банк получателя (соответствует полям в API)
  nameBankRecipient: string;
  billRecipient: string;
  rbillRecipient: string;
  
  // Основные данные транзакции (соответствует полям в TransactionDTO)
  comment?: string;
  category: string;
  transactionType: TransactionType;
  sum: number;
  typeOperation: TransactionType;
  
  // Дополнительные поля для UI (не отправляются на бэкенд)
  transactionDate?: string; // Для выбора даты
  categoryId?: number;      // Для выбора категории в UI
  
  // Устаревшие поля - оставлены для обратной совместимости
  amount?: number;          // Дубликат sum
  description?: string;     // Дубликат comment
  type?: TransactionType;   // Дубликат transactionType
  
  // Устаревшие поля для банков - оставлены для обратной совместимости
  nameBank?: string;        // Старое поле для nameBankSender
  bill?: string;            // Старое поле для billSender
  rBill?: string;           // Старое поле для rbillSender
  nameBankRecip?: string;   // Старое поле для nameBankRecipient
  billRecip?: string;       // Старое поле для billRecipient
  rBillRecip?: string;      // Старое поле для rbillRecipient
}

const initialFormState: TransactionFormData = {
  // Значения по умолчанию для обязательных полей
  sum: 0,
  comment: '',
  transactionDate: new Date().toISOString().split('T')[0],
  category: '',
  categoryId: 0,
  
  // Типы транзакций
  transactionType: 'DEBIT',
  typeOperation: 'DEBIT',
  type: 'DEBIT',
  
  // Отправитель
  personType: PERSON_TYPE,
  name: '',
  inn: '000000000000', // Дефолтное значение для физлица (12 цифр)
  address: '',
  phone: '',
  
  // Получатель
  personTypeRecipient: PERSON_TYPE,
  nameRecipient: '',
  innRecipient: '000000000000', // Дефолтное значение для физлица (12 цифр)
  addressRecipient: '',
  phoneRecipient: '',
  
  // Банк отправителя
  nameBankSender: 'Сбербанк',
  billSender: '40817810000000000001',
  rbillSender: '30101810400000000225',
  
  // Банк получателя
  nameBankRecipient: 'Сбербанк',
  billRecipient: '40817810000000000002',
  rbillRecipient: '30101810400000000226',
  
  // Для совместимости с формой
  amount: 0,
  description: ''
};

interface FormErrors {
  // Основные поля
  sum?: string;
  amount?: string;
  comment?: string;
  description?: string;
  transactionDate?: string;
  category?: string;
  categoryId?: string;
  transactionType?: string;
  typeOperation?: string;
  type?: string;
  
  // Поля отправителя
  personType?: string;
  name?: string;
  inn?: string;
  address?: string;
  phone?: string;
  
  // Поля получателя
  personTypeRecipient?: string;
  nameRecipient?: string;
  innRecipient?: string;
  addressRecipient?: string;
  phoneRecipient?: string;
  
  // Банк отправителя
  nameBank?: string;
  bill?: string;
  rBill?: string;
  
  // Банк получателя
  nameBankRecip?: string;
  billRecip?: string;
  rBillRecip?: string;
}

const TransactionFormModal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const theme = useTheme();
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedTransaction, loading, error } = useAppSelector(state => state.transactions);
  const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
  
  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [date, setDate] = useState<Date | null>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Функция для смены вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Фильтруем категории по типу транзакции
  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(category => category.type === formData.transactionType)
    : [];
  
  // Группируем категории для удобного отображения
  const expenseCategories = React.useMemo(() => {
    return Array.isArray(categories) 
      ? categories.filter(category => category.type === 'CREDIT' || category.applicableType === 'CREDIT')
      : [];
  }, [categories]);
    
  const incomeCategories = React.useMemo(() => {
    return Array.isArray(categories) 
      ? categories.filter(category => category.type === 'DEBIT' || category.applicableType === 'DEBIT')
      : [];
  }, [categories]);
  
  // Загружаем все категории при загрузке компонента
  useEffect(() => {
    console.log('Компонент загружается, вызываем fetchAllCategories');
    
    // Загружаем все категории независимо от типа
    dispatch(fetchAllCategories())
      .then((result) => {
        console.log('Результат загрузки всех категорий:', result);
        
        // Затем загружаем категории для конкретного типа текущей транзакции
        if (formData.transactionType) {
          console.log(`Загружаем категории для типа ${formData.transactionType}`);
          dispatch(fetchCategoriesByType(formData.transactionType));
        }
      })
      .catch((err) => {
        console.error('Ошибка при загрузке категорий:', err);
      });
    
    if (isEditing && id) {
      dispatch(fetchTransactionById(Number(id)));
    }
    
    return () => {
      dispatch(clearSelectedTransaction());
    };
  }, [dispatch, isEditing, id]);
  
  // Загружаем категории если меняется тип транзакции
  useEffect(() => {
    if (formData.transactionType) {
      console.log(`Тип транзакции изменен на: ${formData.transactionType}, загружаем соответствующие категории`);
      dispatch(fetchCategoriesByType(formData.transactionType))
        .then((result) => {
          console.log(`Результат загрузки категорий типа ${formData.transactionType}:`, result);
        })
        .catch((err) => {
          console.error(`Ошибка при загрузке категорий типа ${formData.transactionType}:`, err);
        });
    }
  }, [dispatch, formData.transactionType]);
  
  // Выводим в консоль состояние категорий для отладки
  useEffect(() => {
    console.log('Загруженные категории:', categories);
    console.log('Тип категорий в массиве:', categories?.map(cat => cat.type || cat.applicableType));
    console.log('Категории расходов (CREDIT):', expenseCategories?.length, expenseCategories);
    console.log('Категории доходов (DEBIT):', incomeCategories?.length, incomeCategories);
    console.log('Тип выбранной транзакции:', formData.transactionType);
  }, [categories, incomeCategories, expenseCategories, formData.transactionType]);
  
  // Set form data when editing
  useEffect(() => {
    if (isEditing && selectedTransaction) {
      // Убедимся, что все обязательные поля DTO присутствуют
      const completeTransaction = {
        ...initialFormState,
        ...selectedTransaction
      };
      setFormData(completeTransaction);
      
      // Корректная установка даты
      if (completeTransaction.transactionDate && typeof completeTransaction.transactionDate === 'string') {
        try {
          setDate(new Date(completeTransaction.transactionDate));
        } catch (e) {
          console.error('Ошибка при установке даты:', e);
          setDate(new Date());
        }
      }
    }
  }, [isEditing, selectedTransaction]);
  
  // Функция закрытия и перенаправления
  const handleClose = () => {
    // Сначала выполняем навигацию напрямую
    navigate('/transactions', { replace: true });
    
    // Затем закрываем модальное окно
    setOpen(false);
  };
  
  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      // Если меняем тип транзакции, сбрасываем categoryId
      if (name === 'type' || name === 'transactionType' || name === 'typeOperation') {
        const transactionType = String(value) as TransactionType;
        console.log(`Смена типа транзакции на: ${transactionType}`);
        setFormData(prev => ({
          ...prev,
          type: transactionType,
          transactionType: transactionType,
          typeOperation: transactionType,
          categoryId: 0, // Сбрасываем выбранную категорию при смене типа
          category: '' // Сбрасываем строковое представление категории
        }));
        
        // Загружаем соответствующие категории для выбранного типа
        dispatch(fetchCategoriesByType(transactionType));
      } else if (name === 'sum' || name === 'amount') {
        // Обработка изменения суммы - синхронизируем оба поля
        const numericValue = parseFloat(String(value));
        if (!isNaN(numericValue)) {
          setFormData(prev => ({
            ...prev,
            sum: numericValue,
            amount: numericValue
          }));
        }
      } else if (name === 'comment' || name === 'description') {
        // Обработка изменения комментария - синхронизируем оба поля
        const stringValue = String(value);
        setFormData(prev => ({
          ...prev,
          comment: stringValue,
          description: stringValue
        }));
      } else if (name === 'categoryId') {
        // Обработка выбора категории - синхронизируем поле category
        const categoryId = Number(value);
        setFormData(prev => ({
          ...prev,
          categoryId: categoryId,
          category: categoryId.toString()
        }));
      } else {
        // Обычная обработка других полей
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };
  
  // Handle change for selects
  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setDate(newDate);
      const formattedDate = newDate.toISOString().split('T')[0];
      setFormData({
        ...formData,
        transactionDate: formattedDate
      });
    }
  };
  
  // Валидация формы перед отправкой
  const validateForm = () => {
    let isValid = true;
    const errors: FormErrors = {};
    
    try {
      // Проверяем основные обязательные поля
      if (formData.sum <= 0) {
        errors.sum = 'Сумма должна быть больше нуля';
        isValid = false;
      }
      
      // Проверка типа транзакции
      if (!formData.transactionType) {
        errors.transactionType = 'Тип транзакции обязателен';
        isValid = false;
      }
      
      // Проверка категории (если есть хотя бы одна категория)
      if (filteredCategories.length > 0 && !formData.category) {
        errors.category = 'Выберите категорию';
        isValid = false;
      }
      
      // Проверка ИНН отправителя (12 цифр для физлица или 10 для юрлица)
      if (!formData.inn) {
        errors.inn = 'ИНН обязателен';
        isValid = false;
      } else if (
        formData.personType === PERSON_TYPE && !/^\d{12}$/.test(formData.inn.replace(/\D/g, ''))
      ) {
        errors.inn = 'ИНН физического лица должен содержать 12 цифр';
        isValid = false;
      } else if (
        formData.personType === LEGAL_TYPE && !/^\d{10}$/.test(formData.inn.replace(/\D/g, ''))
      ) {
        errors.inn = 'ИНН юридического лица должен содержать 10 цифр';
        isValid = false;
      }
      
      // Проверка ИНН получателя
      if (!formData.innRecipient) {
        errors.innRecipient = 'ИНН получателя обязателен';
        isValid = false;
      } else if (
        formData.personTypeRecipient === PERSON_TYPE && 
        !/^\d{12}$/.test(formData.innRecipient.replace(/\D/g, ''))
      ) {
        errors.innRecipient = 'ИНН физического лица должен содержать 12 цифр';
        isValid = false;
      } else if (
        formData.personTypeRecipient === LEGAL_TYPE && 
        !/^\d{10}$/.test(formData.innRecipient.replace(/\D/g, ''))
      ) {
        errors.innRecipient = 'ИНН юридического лица должен содержать 10 цифр';
        isValid = false;
      }
      
      // Проверка банка отправителя (@NotNull на бэкенде)
      if (!formData.nameBankSender?.trim()) {
        errors.nameBankSender = 'Название банка отправителя обязательно';
        isValid = false;
      }
      
      // Проверка банка получателя (@NotNull на бэкенде)
      if (!formData.nameBankRecipient?.trim()) {
        errors.nameBankRecipient = 'Название банка получателя обязательно';
        isValid = false;
      }
      
      // Проверка счета отправителя (@NotNull на бэкенде)
      if (!formData.billSender?.trim()) {
        errors.billSender = 'Счет отправителя обязателен';
        isValid = false;
      } else if (!/^\d{20}$/.test(formData.billSender.replace(/\D/g, ''))) {
        errors.billSender = 'Счет должен содержать 20 цифр';
        isValid = false;
      }
      
      // Проверка расчетного счета отправителя (@NotNull на бэкенде)
      if (!formData.rbillSender?.trim()) {
        errors.rbillSender = 'Корреспондентский счет отправителя обязателен';
        isValid = false;
      } else if (!/^\d{20}$/.test(formData.rbillSender.replace(/\D/g, ''))) {
        errors.rbillSender = 'Корреспондентский счет должен содержать 20 цифр';
        isValid = false;
      }
      
      // Проверка счета получателя (@NotNull на бэкенде)
      if (!formData.billRecipient?.trim()) {
        errors.billRecipient = 'Счет получателя обязателен';
        isValid = false;
      } else if (!/^\d{20}$/.test(formData.billRecipient.replace(/\D/g, ''))) {
        errors.billRecipient = 'Счет должен содержать 20 цифр';
        isValid = false;
      }
      
      // Проверка расчетного счета получателя (@NotNull на бэкенде)
      if (!formData.rbillRecipient?.trim()) {
        errors.rbillRecipient = 'Корреспондентский счет получателя обязателен';
        isValid = false;
      } else if (!/^\d{20}$/.test(formData.rbillRecipient.replace(/\D/g, ''))) {
        errors.rbillRecipient = 'Корреспондентский счет должен содержать 20 цифр';
        isValid = false;
      }
    } catch (error) {
      console.error('Ошибка валидации:', error);
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Форма содержит ошибки, отправка отменена');
      return;
    }
    
    try {
      setIsSaving(true);
      
      console.log('Отправляемые данные:', formData);
      
      // Преобразуем формат данных для отправки на сервер
      const transactionData = {
        id: formData.id,
        
        // Основные данные
        sum: parseFloat(formData.sum.toString()),
        comment: formData.comment || formData.description || '',
        transactionType: formData.transactionType,
        typeOperation: formData.typeOperation,
        
        // Отправитель
        personType: formData.personType,
        name: (formData.name || '').trim(),
        inn: (formData.inn || '').trim().replace(/\D/g, ''),
        address: (formData.address || '').trim(),
        phone: (formData.phone || '').trim(),
        
        // Получатель
        personTypeRecipient: formData.personTypeRecipient,
        nameRecipient: (formData.nameRecipient || '').trim(),
        innRecipient: (formData.innRecipient || '').trim().replace(/\D/g, ''),
        addressRecipient: (formData.addressRecipient || '').trim(),
        phoneRecipient: (formData.phoneRecipient || '').trim(),
        recipientPhoneRecipient: (formData.phoneRecipient || '').trim(), // Дублируем поле для совместимости с бэкендом
        
        // Данные для бэкенда должны использовать имена полей из TransactionDTO (не LiteTransactionDTO)
        
        // Банк отправителя
        nameBank: (formData.nameBankSender || '').trim(),
        bill: (formData.billSender || '').trim(),
        rBill: (formData.rbillSender || '').trim(),
        
        // Банк получателя
        nameBankRecip: (formData.nameBankRecipient || '').trim(),
        billRecip: (formData.billRecipient || '').trim().replace(/\D/g, ''),
        rBillRecip: (formData.rbillRecipient || '').trim().replace(/\D/g, ''),
        
        // Данные транзакции
        category: formData.category || '', // Используем строковое представление категории
        status: isEditing ? (selectedTransaction?.status || 'NEW') : 'NEW' // Если новая транзакция, то статус NEW
      };
      
      // Проверяем наличие токена авторизации
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации!');
        alert('Ошибка: вы не авторизованы в системе. Пожалуйста, войдите снова.');
        // Перенаправление на страницу логина
        navigate('/login');
        return;
      }
      
      // Логируем данные перед отправкой
      console.log('Данные для отправки:', transactionData);
      
      try {
        // Проверяем корректность JSON
        JSON.parse(JSON.stringify(transactionData));
      } catch (jsonError) {
        console.error('Ошибка валидации JSON:', jsonError);
        throw new Error('Ошибка формата данных: ' + String(jsonError));
      }
      
      if (isEditing && id) {
        await dispatch(updateTransaction({ id: Number(id), data: transactionData as Transaction })).unwrap();
      } else {
        await dispatch(createTransaction(transactionData as Transaction)).unwrap();
      }
      
      // Обновляем список транзакций
      dispatch(fetchAllTransactions());
      
      // Перенаправляем на страницу транзакций
      handleClose();
    } catch (err) {
      console.error('Ошибка сохранения транзакции:', err);
      if (err instanceof Error) {
        alert(`Ошибка: ${err.message}`);
      } else {
        alert('Возникла ошибка при сохранении транзакции');
      }
      setIsSaving(false);
    }
  };

  // Получаем имя категории по ID
  const getCategoryNameById = (id: number | string): string => {
    if (!id) return 'Категория не указана';
    
    // Преобразуем ID в строку для сравнения
    const categoryIdStr = String(id);
    
    const category = Array.isArray(categories) 
      ? categories.find(cat => String(cat.id) === categoryIdStr)
      : null;
      
    return category ? category.name : 'Категория не найдена';
  };
  
  // Получаем ID категории по имени
  const getCategoryIdByName = (name: string): number | null => {
    if (!name) return null;
    
    const category = Array.isArray(categories) 
      ? categories.find(cat => cat.name === name)
      : null;
      
    return category ? category.id : null;
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isSaving ? undefined : handleClose}
      maxWidth="lg" 
      fullWidth
      disableEscapeKeyDown={isSaving}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          maxHeight: '92vh', // Ограничиваем максимальную высоту
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 245, 250, 0.9))',
          backdropFilter: 'blur(10px)'
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(30, 30, 40, 0.5)',
          backdropFilter: 'blur(5px)'
        }
      }}
    >
      <Box>
        <DialogTitle sx={{ 
          p: {xs: 1.5, sm: 2}, // Уменьшаем отступы на малых экранах
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <span className="transaction-title">
            {isEditing ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </span>
          {!isSaving && (
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={isSaving ? undefined : handleClose}
              size="small"
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: {xs: 1.5, sm: 2}, // Уменьшаем отступы на малых экранах
          overflowY: 'auto', // Добавляем прокрутку для содержимого
          maxHeight: 'calc(92vh - 64px)' // Учитываем заголовок
        }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              mb: 2,
              mt: 1,
              gap: 1.5
            }}>
              <ToggleButtonGroup
                value={formData.transactionType || formData.type}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    const transactionType = newValue as TransactionType;
                    setFormData(prev => ({
                      ...prev,
                      type: transactionType,
                      transactionType: transactionType,
                      typeOperation: transactionType,
                      categoryId: 0 // Сбрасываем выбранную категорию при смене типа
                    }));
                  }
                }}
                color="primary"
                size="medium"
                sx={{ minWidth: {xs: '100%', sm: '200px'} }}
                disabled={isSaving}
              >
                <ToggleButton 
                  value="CREDIT" 
                  sx={{ 
                    py: 0.75,
                    color: 'success.main',
                    '&.Mui-selected': {
                      bgcolor: 'success.main',
                      color: 'white',
                    }
                  }}
                >
                  <TrendingUp sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Доход
                </ToggleButton>
                <ToggleButton 
                  value="DEBIT" 
                  sx={{ 
                    py: 0.75,
                    color: 'error.main',
                    '&.Mui-selected': {
                      bgcolor: 'error.main',
                      color: 'white',
                    }
                  }}
                >
                  <TrendingDown sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Расход
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                color="secondary"
                size="medium" // Уменьшаем размер кнопки
                disabled={isSaving}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    status: 'COMPLETED'
                  }));
                  // Автоматически отправляем форму
                  handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>);
                }}
                sx={{ 
                  minWidth: {xs: '100%', sm: '140px'},
                  height: {xs: '40px', sm: '42px'},
                  py: 0.75,
                  bgcolor: '#FFCA28', // Желтый цвет
                  color: '#000000',
                  '&:hover': {
                    bgcolor: '#FFB300'
                  },
                  fontWeight: 'bold',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
                }}
              >
                Провести
              </Button>
            </Box>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Основная информация" />
                <Tab label="Реквизиты" />
              </Tabs>
            </Box>
            
            {activeTab === 0 && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <TextField
                    id="transaction-amount"
                    name="amount"
                    type="number"
                    value={formData.sum || formData.amount || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        amount: value,
                        sum: value
                      }));
                    }}
                    placeholder="0"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₽</InputAdornment>
                      ),
                    }}
                    error={!!formErrors.sum || !!formErrors.amount}
                    helperText={formErrors.sum || formErrors.amount}
                    label="Сумма"
                    size="small" // Уменьшаем размер поля
                    variant="outlined"
                    disabled={isSaving}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <TextField
                    id="transaction-description"
                    name="description"
                    value={formData.comment || formData.description || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        description: value,
                        comment: value
                      }));
                    }}
                    placeholder="Описание транзакции"
                    multiline
                    rows={2}
                    error={!!formErrors.comment || !!formErrors.description}
                    helperText={formErrors.comment || formErrors.description}
                    label="Описание"
                    size="small" // Уменьшаем размер поля
                    variant="outlined"
                    disabled={isSaving}
                  />
                </FormControl>

                <FormControl fullWidth error={!!formErrors.categoryId}>
                  <InputLabel id="transaction-category-label">Категория</InputLabel>
                  <Select
                    labelId="transaction-category-label"
                    id="transaction-category"
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={(e: SelectChangeEvent<unknown>) => {
                      // Получаем ID категории как число
                      const categoryId = Number(e.target.value);
                      
                      // Если выбрана категория (не пустое значение)
                      if (categoryId) {
                        // Находим объект категории
                        const selectedCategory = categories.find(cat => cat.id === categoryId);
                        console.log(`Выбрана категория с ID: ${categoryId}, Имя: ${selectedCategory?.name || 'Неизвестно'}`);
                        
                        // Обновляем поля: categoryId для ID и category для имени категории
                        setFormData(prev => ({
                          ...prev,
                          categoryId: categoryId,
                          category: selectedCategory?.name || '' // Сохраняем имя категории, а не ID
                        }));
                        
                        // Выводим в консоль для отладки
                        console.log('Выбранная категория:', selectedCategory?.name || 'Неизвестно');
                      } else {
                        // Сброс категории
                        setFormData(prev => ({
                          ...prev,
                          categoryId: 0,
                          category: ''
                        }));
                      }
                    }}
                    label="Категория"
                    size="small" // Уменьшаем размер поля
                    variant="outlined"
                    disabled={isSaving}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ mr: 1, color: formData.type === 'DEBIT' ? 'error.main' : 'success.main' }} />
                        {getCategoryNameById(selected as number)}
                      </Box>
                    )}
                  >
                    <MenuItem value="" disabled>
                      <em>Выберите категорию</em>
                    </MenuItem>
                    
                    {/* Отладочная информация о количестве категорий */}
                    <MenuItem disabled>
                      <Typography variant="caption" color="text.secondary">
                        Всего категорий: {categories?.length || 0} | 
                        Доходы: {incomeCategories?.length || 0} | 
                        Расходы: {expenseCategories?.length || 0}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    
                    {/* Показываем категории в зависимости от выбранного типа транзакции */}
                    {formData.type === 'DEBIT' ? (
                      /* Для расхода (DEBIT) показываем категории расходов */
                      [
                        <Box key="expense-header" sx={{ px: 2, py: 0.75 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Категории расходов {expenseCategories?.length ? `(${expenseCategories.length})` : '(нет категорий)'}
                          </Typography>
                        </Box>,
                        expenseCategories && expenseCategories.length > 0 ? 
                          expenseCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))
                        : 
                          <MenuItem key="no-expense" disabled>
                            <Typography variant="body2" color="text.secondary">
                              Нет категорий расходов. Создайте их в разделе "Категории".
                            </Typography>
                          </MenuItem>
                      ]
                    ) : (
                      /* Для дохода (CREDIT) показываем категории доходов */
                      [
                        <Box key="income-header" sx={{ px: 2, py: 0.75 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Категории доходов {incomeCategories?.length ? `(${incomeCategories.length})` : '(нет категорий)'}
                          </Typography>
                        </Box>,
                        incomeCategories && incomeCategories.length > 0 ?
                          incomeCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))
                        :
                          <MenuItem key="no-income" disabled>
                            <Typography variant="body2" color="text.secondary">
                              Нет категорий доходов. Создайте их в разделе "Категории".
                            </Typography>
                          </MenuItem>
                      ]
                    )}
                    
                    {categoriesLoading && (
                      <MenuItem disabled>
                        <CircularProgress size={16} sx={{ mr: 1 }} /> Загрузка категорий...
                      </MenuItem>
                    )}
                  </Select>
                  {formErrors.categoryId && (
                    <FormHelperText error>{formErrors.categoryId}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  gap: 2,
                  maxHeight: {xs: 'auto', md: '70vh'},
                  overflow: 'auto'
                }}>
                  {/* Колонка отправителя и его банка */}
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Отправитель
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <FormControl fullWidth>
                          <InputLabel id="person-type-label">Тип лица</InputLabel>
                          <Select
                            labelId="person-type-label"
                            id="person-type"
                            name="personType"
                            value={formData.personType || PERSON_TYPE}
                            onChange={handleSelectChange}
                            label="Тип лица"
                            size="small" // Уменьшаем размер поля
                            disabled={isSaving}
                          >
                            <MenuItem value={PERSON_TYPE}>Физическое лицо</MenuItem>
                            <MenuItem value={LEGAL_TYPE}>Юридическое лицо</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          label="Имя/Название организации"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="ИНН"
                          name="inn"
                          value={formData.inn || ''}
                          onChange={handleChange}
                          error={!!formErrors.inn}
                          helperText={formErrors.inn}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Адрес"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Телефон"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleChange}
                          placeholder="+7XXXXXXXXXX"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                          error={!!formErrors.phone}
                          helperText={formErrors.phone}
                        />
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, mt: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Банк отправителя
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <TextField
                          label="Название банка"
                          name="nameBankSender"
                          value={formData.nameBankSender || ''}
                          onChange={handleChange}
                          error={!!formErrors.nameBankSender}
                          helperText={formErrors.nameBankSender}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Расчетный счет"
                          name="billSender"
                          value={formData.billSender || ''}
                          onChange={handleChange}
                          placeholder="20 цифр"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Корреспондентский счет"
                          name="rbillSender"
                          value={formData.rbillSender || ''}
                          onChange={handleChange}
                          placeholder="20 цифр"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />
                      </Stack>
                    </Paper>
                  </Box>

                  {/* Колонка получателя и его банка */}
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Получатель
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <FormControl fullWidth>
                          <InputLabel id="recipient-type-label">Тип лица получателя</InputLabel>
                          <Select
                            labelId="recipient-type-label"
                            id="recipient-type"
                            name="personTypeRecipient"
                            value={formData.personTypeRecipient || PERSON_TYPE}
                            onChange={handleSelectChange}
                            label="Тип лица получателя"
                            size="small" // Уменьшаем размер поля
                            disabled={isSaving}
                          >
                            <MenuItem value={PERSON_TYPE}>Физическое лицо</MenuItem>
                            <MenuItem value={LEGAL_TYPE}>Юридическое лицо</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          label="Имя/Название организации получателя"
                          name="nameRecipient"
                          value={formData.nameRecipient || ''}
                          onChange={handleChange}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="ИНН получателя"
                          name="innRecipient"
                          value={formData.innRecipient || ''}
                          onChange={handleChange}
                          error={!!formErrors.innRecipient}
                          helperText={formErrors.innRecipient}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Адрес получателя"
                          name="addressRecipient"
                          value={formData.addressRecipient || ''}
                          onChange={handleChange}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Телефон получателя"
                          name="phoneRecipient"
                          value={formData.phoneRecipient || ''}
                          onChange={handleChange}
                          placeholder="+7XXXXXXXXXX"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                          error={!!formErrors.phoneRecipient}
                          helperText={formErrors.phoneRecipient}
                        />
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, mt: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Банк получателя
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <TextField
                          label="Название банка получателя"
                          name="nameBankRecipient"
                          value={formData.nameBankRecipient || ''}
                          onChange={handleChange}
                          error={!!formErrors.nameBankRecipient}
                          helperText={formErrors.nameBankRecipient}
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Расчетный счет получателя"
                          name="billRecipient"
                          value={formData.billRecipient || ''}
                          onChange={handleChange}
                          error={!!formErrors.billRecipient}
                          helperText={formErrors.billRecipient}
                          placeholder="20 цифр"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />

                        <TextField
                          label="Корреспондентский счет получателя"
                          name="rbillRecipient"
                          value={formData.rbillRecipient || ''}
                          onChange={handleChange}
                          error={!!formErrors.rbillRecipient}
                          helperText={formErrors.rbillRecipient}
                          placeholder="20 цифр"
                          size="small" // Уменьшаем размер поля
                          disabled={isSaving}
                        />
                      </Stack>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          
          {isSaving && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={36} />
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default TransactionFormModal;
