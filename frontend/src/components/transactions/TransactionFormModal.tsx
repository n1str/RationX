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
  recipientPhoneRecipient?: string;
  
  // Банк отправителя (соответствует полям в TransactionDTO)
  nameBank: string;
  bill?: string;
  rBill?: string;
  
  // Банк получателя (соответствует полям в TransactionDTO)
  nameBankRecip: string;
  billRecip: string;
  rBillRecip: string;
  
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
  recipientPhoneRecipient: '',
  
  // Банк отправителя
  nameBank: 'Сбербанк',
  bill: '40817810000000000001',
  rBill: '30101810400000000225',
  
  // Банк получателя
  nameBankRecip: 'Сбербанк',
  billRecip: '40817810000000000002',
  rBillRecip: '30101810400000000226',
  
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
  recipientPhoneRecipient?: string;
  
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
  
  // Form validation
  const validateForm = () => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Проверка суммы
    if (!formData.sum || formData.sum <= 0) {
      errors.sum = 'Сумма должна быть больше 0';
      isValid = false;
    }
    
    // Проверка на максимальную сумму в соответствии с аннотацией @DecimalMax на бэкенде
    if (formData.sum > 999999.99999) {
      errors.sum = 'Сумма не должна превышать 999,999.99999';
      isValid = false;
    }
    
    // Проверка комментария - необязательное поле на бэкенде
    
    // Проверка даты - бэкенд не требует, но нужно для фронтенда
    if (!formData.transactionDate) {
      errors.transactionDate = 'Дата обязательна';
      isValid = false;
    }
    
    // Проверка категории - обязательное поле на бэкенде (@NotNull)
    if (!formData.category && !formData.categoryId) {
      errors.category = 'Категория обязательна';
      isValid = false;
    }
    
    // Проверка типа транзакции - обязательное поле на бэкенде (@NotNull)
    if (!formData.transactionType) {
      errors.transactionType = 'Тип транзакции обязателен';
      isValid = false;
    }
    
    // Проверка типа операции - обязательное поле на бэкенде (@NotNull)
    if (!formData.typeOperation) {
      errors.typeOperation = 'Тип операции обязателен';
      isValid = false;
    }
    
    // Проверка типа лица отправителя - обязательное поле на бэкенде (@NotNull)
    if (!formData.personType) {
      errors.personType = 'Тип лица отправителя обязателен';
      isValid = false;
    }
    
    // Проверка типа лица получателя - обязательное поле на бэкенде (@NotNull)
    if (!formData.personTypeRecipient) {
      errors.personTypeRecipient = 'Тип лица получателя обязателен';
      isValid = false;
    }
    
    // Проверка ИНН отправителя (@Pattern на бэкенде)
    // Для LEGAL - 10 цифр, для PERSON_TYPE - 12 цифр
    if (formData.personType === LEGAL_TYPE && (!formData.inn || !/^\d{10}$/.test(formData.inn))) {
      errors.inn = 'ИНН юр. лица должен содержать 10 цифр';
      isValid = false;
    } else if (formData.personType === PERSON_TYPE && (!formData.inn || !/^\d{12}$/.test(formData.inn))) {
      errors.inn = 'ИНН физ. лица должен содержать 12 цифр';
      isValid = false;
    }
    
    // Проверка ИНН получателя (@Pattern на бэкенде)
    if (formData.personTypeRecipient === LEGAL_TYPE && (!formData.innRecipient || !/^\d{10}$/.test(formData.innRecipient))) {
      errors.innRecipient = 'ИНН юр. лица должен содержать 10 цифр';
      isValid = false;
    } else if (formData.personTypeRecipient === PERSON_TYPE && (!formData.innRecipient || !/^\d{12}$/.test(formData.innRecipient))) {
      errors.innRecipient = 'ИНН физ. лица должен содержать 12 цифр';
      isValid = false;
    }
    
    // Проверка телефона отправителя (необязательное поле с @Pattern на бэкенде)
    if (formData.phone && !/^(\+7|8)\d{10}$/.test(formData.phone)) {
      errors.phone = 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
      isValid = false;
    }
    
    // Проверка телефона получателя (необязательное поле с @Pattern на бэкенде)
    if (formData.recipientPhoneRecipient && !/^(\+7|8)\d{10}$/.test(formData.recipientPhoneRecipient)) {
      errors.recipientPhoneRecipient = 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
      isValid = false;
    }
    
    // Проверка банка отправителя (@NotNull на бэкенде)
    if (!formData.nameBank?.trim()) {
      errors.nameBank = 'Название банка обязательно';
      isValid = false;
    }
    
    // Проверка банка получателя (@NotNull на бэкенде)
    if (!formData.nameBankRecip?.trim()) {
      errors.nameBankRecip = 'Название банка получателя обязательно';
      isValid = false;
    }
    
    // Проверка счета получателя (@NotNull на бэкенде)
    if (!formData.billRecip?.trim()) {
      errors.billRecip = 'Счет получателя обязателен';
      isValid = false;
    } else if (!/^\d{20}$/.test(formData.billRecip.replace(/\D/g, ''))) {
      errors.billRecip = 'Счет должен содержать 20 цифр';
      isValid = false;
    }
    
    // Проверка расчетного счета получателя (@NotNull на бэкенде)
    if (!formData.rBillRecip?.trim()) {
      errors.rBillRecip = 'Корреспондентский счет получателя обязателен';
      isValid = false;
    } else if (!/^\d{20}$/.test(formData.rBillRecip.replace(/\D/g, ''))) {
      errors.rBillRecip = 'Корреспондентский счет должен содержать 20 цифр';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Проверяем наличие токена авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Ошибка: отсутствует токен авторизации!');
      alert('Ошибка: вы не авторизованы в системе. Пожалуйста, войдите снова.');
      // Перенаправление на страницу логина
      navigate('/login');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Преобразуем числовые значения
      const numericSum = typeof formData.sum === 'string' 
        ? parseFloat(formData.sum) 
        : (formData.sum || 0);
        
      if (isNaN(numericSum) || numericSum <= 0) {
        throw new Error('Сумма транзакции должна быть положительным числом');
      }
      
      // Убеждаемся, что category - это строка (ID категории)
      const categoryString = formData.category || 
                          (formData.categoryId ? formData.categoryId.toString() : '');
      
      if (!categoryString) {
        throw new Error('Необходимо выбрать категорию');
      }
      
      // Подготавливаем ИНН с учетом типа лица
      const senderInn = formData.inn?.trim() || 
                      (formData.personType === PERSON_TYPE ? '000000000000' : '0000000000');
      const recipientInn = formData.innRecipient?.trim() || 
                          (formData.personTypeRecipient === PERSON_TYPE ? '000000000000' : '0000000000');
      
      // Структура данных в точном соответствии с TransactionDTO на бэкенде
      const dataToSubmit = {
        
        // Отправитель
        personType: formData.personType,
        name: (formData.name || '').trim(),
        inn: senderInn,
        address: (formData.address || '').trim(),
        phone: (formData.phone || '').trim(),
        
        // Получатель
        personTypeRecipient: formData.personTypeRecipient,
        nameRecipient: (formData.nameRecipient || '').trim(),
        innRecipient: recipientInn,
        addressRecipient: (formData.addressRecipient || '').trim(),
        recipientPhoneRecipient: (formData.recipientPhoneRecipient || '').trim(),
        
        // Банк отправителя
        nameBank: (formData.nameBank || '').trim(),
        bill: (formData.bill || '').trim(),
        rBill: (formData.rBill || '').trim(),
        
        // Банк получателя
        nameBankRecip: (formData.nameBankRecip || '').trim(),
        billRecip: (formData.billRecip || '').trim().replace(/\D/g, ''),
        rBillRecip: (formData.rBillRecip || '').trim().replace(/\D/g, ''),
        
        // Данные транзакции
        comment: (formData.comment || '').trim(),
        category: categoryString,
        transactionType: formData.transactionType,
        sum: numericSum,
        typeOperation: formData.typeOperation
      };
      
      // Очищаем строки от спецсимволов
      Object.keys(dataToSubmit).forEach(key => {
        const value = (dataToSubmit as any)[key];
        if (typeof value === 'string') {
          (dataToSubmit as any)[key] = value.replace(/[\u0000-\u001F\u007F-\u009F\\"\n\r\t]/g, '');
        }
      });
      
      // Логируем данные перед отправкой
      console.log('Данные для отправки:', dataToSubmit);
      
      try {
        // Проверяем корректность JSON
        JSON.parse(JSON.stringify(dataToSubmit));
      } catch (jsonError) {
        console.error('Ошибка валидации JSON:', jsonError);
        throw new Error('Ошибка формата данных: ' + String(jsonError));
      }
      
      if (isEditing && id) {
        await dispatch(updateTransaction({ id: Number(id), data: dataToSubmit as Transaction })).unwrap();
      } else {
        await dispatch(createTransaction(dataToSubmit as Transaction)).unwrap();
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
  const getCategoryNameById = (id: number): string => {
    const category = Array.isArray(categories) 
      ? categories.find(cat => cat.id === id)
      : null;
    return category ? category.name : 'Категория не найдена';
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
          p: 2,
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
        
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              mb: 3,
              mt: 1,
              gap: 2
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
                sx={{ minWidth: 250 }}
                disabled={isSaving}
              >
                <ToggleButton 
                  value="CREDIT" 
                  sx={{ 
                    py: 1,
                    color: 'success.main',
                    '&.Mui-selected': {
                      bgcolor: 'success.main',
                      color: 'white',
                    }
                  }}
                >
                  <TrendingUp sx={{ mr: 1 }} />
                  Доход
                </ToggleButton>
                <ToggleButton 
                  value="DEBIT" 
                  sx={{ 
                    py: 1,
                    color: 'error.main',
                    '&.Mui-selected': {
                      bgcolor: 'error.main',
                      color: 'white',
                    }
                  }}
                >
                  <TrendingDown sx={{ mr: 1 }} />
                  Расход
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                color="secondary"
                size="large"
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
                  minWidth: 180,
                  height: '48px',
                  py: 1,
                  bgcolor: '#FFCA28', // Желтый цвет
                  color: '#000000',
                  '&:hover': {
                    bgcolor: '#FFB300'
                  },
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
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
              <Stack spacing={2.5}>
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
                    size="medium"
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
                    size="medium"
                    variant="outlined"
                    disabled={isSaving}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <DatePicker
                      label="Дата транзакции"
                      value={date}
                      onChange={handleDateChange}
                      disabled={isSaving}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.transactionDate,
                          helperText: formErrors.transactionDate,
                          size: "medium",
                          variant: "outlined"
                        },
                      }}
                    />
                  </LocalizationProvider>
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
                        console.log(`Выбрана категория с ID: ${categoryId}`);
                        
                        // Обновляем оба поля: categoryId для формы и category для API
                        setFormData(prev => ({
                          ...prev,
                          categoryId: categoryId,
                          category: categoryId.toString()
                        }));
                        
                        // Выводим в консоль для отладки
                        const selectedCategory = categories.find(cat => cat.id === categoryId);
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
                    size="medium"
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
                        <Box key="expense-header" sx={{ px: 2, py: 1 }}>
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
                        <Box key="income-header" sx={{ px: 2, py: 1 }}>
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
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Загрузка категорий...
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  {/* Колонка отправителя и его банка */}
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Отправитель
                      </Typography>
                      
                      <Stack spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel id="person-type-label">Тип лица</InputLabel>
                          <Select
                            labelId="person-type-label"
                            id="person-type"
                            name="personType"
                            value={formData.personType || PERSON_TYPE}
                            onChange={handleSelectChange}
                            label="Тип лица"
                            size="medium"
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
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="ИНН"
                          name="inn"
                          value={formData.inn || ''}
                          onChange={handleChange}
                          error={!!formErrors.inn}
                          helperText={formErrors.inn}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Адрес"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Телефон"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleChange}
                          placeholder="+7XXXXXXXXXX"
                          size="medium"
                          disabled={isSaving}
                          error={!!formErrors.phone}
                          helperText={formErrors.phone}
                        />
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mt: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Банк отправителя
                      </Typography>
                      
                      <Stack spacing={2}>
                        <TextField
                          label="Название банка"
                          name="nameBank"
                          value={formData.nameBank || ''}
                          onChange={handleChange}
                          error={!!formErrors.nameBank}
                          helperText={formErrors.nameBank}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Расчетный счет"
                          name="bill"
                          value={formData.bill || ''}
                          onChange={handleChange}
                          placeholder="20 цифр"
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Корреспондентский счет"
                          name="rBill"
                          value={formData.rBill || ''}
                          onChange={handleChange}
                          placeholder="20 цифр"
                          size="medium"
                          disabled={isSaving}
                        />
                      </Stack>
                    </Paper>
                  </Box>

                  {/* Колонка получателя и его банка */}
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Получатель
                      </Typography>
                      
                      <Stack spacing={2}>
                        <FormControl fullWidth>
                          <InputLabel id="recipient-type-label">Тип лица получателя</InputLabel>
                          <Select
                            labelId="recipient-type-label"
                            id="recipient-type"
                            name="personTypeRecipient"
                            value={formData.personTypeRecipient || PERSON_TYPE}
                            onChange={handleSelectChange}
                            label="Тип лица получателя"
                            size="medium"
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
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="ИНН получателя"
                          name="innRecipient"
                          value={formData.innRecipient || ''}
                          onChange={handleChange}
                          error={!!formErrors.innRecipient}
                          helperText={formErrors.innRecipient}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Адрес получателя"
                          name="addressRecipient"
                          value={formData.addressRecipient || ''}
                          onChange={handleChange}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Телефон получателя"
                          name="recipientPhoneRecipient"
                          value={formData.recipientPhoneRecipient || ''}
                          onChange={handleChange}
                          placeholder="+7XXXXXXXXXX"
                          size="medium"
                          disabled={isSaving}
                          error={!!formErrors.recipientPhoneRecipient}
                          helperText={formErrors.recipientPhoneRecipient}
                        />
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mt: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Банк получателя
                      </Typography>
                      
                      <Stack spacing={2}>
                        <TextField
                          label="Название банка получателя"
                          name="nameBankRecip"
                          value={formData.nameBankRecip || ''}
                          onChange={handleChange}
                          error={!!formErrors.nameBankRecip}
                          helperText={formErrors.nameBankRecip}
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Расчетный счет получателя"
                          name="billRecip"
                          value={formData.billRecip || ''}
                          onChange={handleChange}
                          error={!!formErrors.billRecip}
                          helperText={formErrors.billRecip}
                          placeholder="20 цифр"
                          size="medium"
                          disabled={isSaving}
                        />

                        <TextField
                          label="Корреспондентский счет получателя"
                          name="rBillRecip"
                          value={formData.rBillRecip || ''}
                          onChange={handleChange}
                          error={!!formErrors.rBillRecip}
                          helperText={formErrors.rBillRecip}
                          placeholder="20 цифр"
                          size="medium"
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
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default TransactionFormModal;
