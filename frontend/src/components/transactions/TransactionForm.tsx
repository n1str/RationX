import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Stack,
  FormLabel,
  Divider,
  Alert,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Save,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { 
  createTransaction, 
  updateTransaction, 
  fetchTransactionById,
  clearSelectedTransaction
} from '../../store/slices/transactionsSlice';
import { 
  fetchAllCategories,
  fetchCategoriesByType
} from '../../store/slices/categoriesSlice';
import { 
  Transaction, 
  TransactionType,
  PersonType 
} from '../../services/transactionService';
import { Category } from '../../services/categoryService';

// Объявляем константы для PersonType
const PERSON_TYPE: PersonType = 'PERSON_TYPE';
const LEGAL_TYPE: PersonType = 'LEGAL';

const initialFormState: Partial<Transaction> = {
  sum: 0,
  comment: '',
  transactionDate: new Date().toISOString().split('T')[0],
  category: '',
  transactionType: 'DEBIT',
  typeOperation: 'DEBIT',
  personType: PERSON_TYPE,
  inn: '000000000000', // Дефолтное значение для физлица
  personTypeRecipient: PERSON_TYPE,
  innRecipient: '000000000000', // Дефолтное значение для физлица
  nameBank: 'Сбербанк', // Дефолтное значение
  nameBankRecip: 'Сбербанк', // Дефолтное значение
  billRecip: '40000000000000000000', // Дефолтное значение
  rBillRecip: '40000000000000000000', // Дефолтное значение
  bill: '',
  rBill: '',
  name: '',
  nameRecipient: '',
  address: '',
  addressRecipient: '',
  phone: '',
  recipientPhoneRecipient: '',
  
  // Для совместимости со старым кодом
  amount: 0,
  description: '',
  categoryId: 0,
  type: 'DEBIT'
};

interface FormValues {
  type: Transaction['type'];
  amount: number;
  description: string;
  transactionDate: string;
  categoryId: number | null;
  notes?: string;
  recipientName?: string;
  recipientInn?: string;
  recipientBank?: string;
}

interface FormErrors {
  sum?: string;
  comment?: string;
  transactionDate?: string;
  category?: string;
  inn?: string;
  innRecipient?: string;
  nameBank?: string;
  nameBankRecip?: string;
  billRecip?: string;
  rBillRecip?: string;
  transactionType?: string;
  
  // Для совместимости со старым кодом
  amount?: string;
  description?: string;
  categoryId?: string;
  type?: string;
  phone?: string;
  recipientPhoneRecipient?: string;
  
  // Дополнительные поля для валидации
  bill?: string;
  rBill?: string;
}

const TransactionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedTransaction, loading, error } = useAppSelector(state => state.transactions);
  const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
  
  const [formData, setFormData] = useState<Transaction>(initialFormState as Transaction);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [date, setDate] = useState<Date | null>(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch data
  useEffect(() => {
    dispatch(fetchAllCategories());
    
    if (isEditing && id) {
      dispatch(fetchTransactionById(Number(id))).then(() => {
        if (selectedTransaction) {
          const fullTransaction = {
            ...initialFormState,
            ...selectedTransaction
          };
          setFormData(fullTransaction);
          // Безопасно устанавливаем дату, убедившись, что это валидная строка
          if (fullTransaction.transactionDate && typeof fullTransaction.transactionDate === 'string') {
            const dateValue = new Date(fullTransaction.transactionDate);
            if (!isNaN(dateValue.getTime())) {
              setDate(dateValue);
            }
          }
        }
      });
    }
    
    return () => {
      dispatch(clearSelectedTransaction());
    };
  }, [dispatch, isEditing, id, selectedTransaction]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Clear error for the field
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: undefined,
        }));
      }
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    if (newDate) {
      const formattedDate = newDate.toISOString().split('T')[0];
      handleChange({
        target: {
          name: 'transactionDate',
          value: formattedDate,
        }
      } as React.ChangeEvent<HTMLInputElement>);
      
      // Обновляем для совместимости
      handleChange({
        target: {
          name: 'date',
          value: formattedDate,
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    // Проверка суммы
    if (!formData.sum || formData.sum <= 0) {
      errors.sum = 'Сумма должна быть больше 0';
      errors.amount = 'Сумма должна быть больше 0'; // Для совместимости
      isValid = false;
    }
    
    // Проверка на максимальную сумму (согласно @DecimalMax в DTO)
    if (formData.sum > 999999.99999) {
      errors.sum = 'Сумма не должна превышать 999,999.99999';
      errors.amount = 'Сумма не должна превышать 999,999.99999'; // Для совместимости
      isValid = false;
    }
    
    // Проверка комментария/описания
    if (!formData.comment?.trim() && !formData.description?.trim()) {
      errors.comment = 'Описание обязательно';
      errors.description = 'Описание обязательно'; // Для совместимости
      isValid = false;
    }
    
    // Проверка даты
    if (!formData.transactionDate) {
      errors.transactionDate = 'Дата обязательна';
      isValid = false;
    }
    
    // Проверка категории
    if (!formData.category && !formData.categoryId) {
      errors.category = 'Категория обязательна';
      errors.categoryId = 'Категория обязательна'; // Для совместимости
      isValid = false;
    }
    
    // Проверка ИНН отправителя
    if (!formData.inn || !/^\d{10}|\d{12}$/.test(formData.inn)) {
      errors.inn = 'ИНН должен содержать 10 или 12 цифр';
      isValid = false;
    }
    
    // Проверка ИНН получателя
    if (!formData.innRecipient || !/^\d{10}|\d{12}$/.test(formData.innRecipient)) {
      errors.innRecipient = 'ИНН должен содержать 10 или 12 цифр';
      isValid = false;
    }
    
    // Проверка телефона отправителя, если он указан
    if (formData.phone && !/^(\+7|8)\d{10}$/.test(formData.phone)) {
      errors.phone = 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
      isValid = false;
    }
    
    // Проверка телефона получателя, если он указан
    if (formData.recipientPhoneRecipient && !/^(\+7|8)\d{10}$/.test(formData.recipientPhoneRecipient)) {
      errors.recipientPhoneRecipient = 'Телефон должен начинаться с +7 или 8 и содержать 11 цифр';
      isValid = false;
    }
    
    // Проверка банка отправителя
    if (!formData.nameBank?.trim()) {
      errors.nameBank = 'Название банка обязательно';
      isValid = false;
    }
    
    // Проверка банка получателя
    if (!formData.nameBankRecip?.trim()) {
      errors.nameBankRecip = 'Название банка обязательно';
      isValid = false;
    }
    
    // Проверка счета получателя
    if (!formData.billRecip?.trim()) {
      errors.billRecip = 'Счет получателя обязателен';
      isValid = false;
    } else if (!/^\d{20}$/.test(formData.billRecip)) {
      errors.billRecip = 'Счет должен содержать 20 цифр';
      isValid = false;
    }
    
    // Проверка расчетного счета получателя
    if (!formData.rBillRecip?.trim()) {
      errors.rBillRecip = 'Расчетный счет получателя обязателен';
      isValid = false;
    } else if (!/^\d{20}$/.test(formData.rBillRecip)) {
      errors.rBillRecip = 'Расчетный счет должен содержать 20 цифр';
      isValid = false;
    }
    
    // Проверка типа транзакции
    if (!formData.transactionType) {
      errors.transactionType = 'Тип транзакции обязателен';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Подготавливаем данные для отправки
      const dataToSubmit = {
        ...initialFormState, // Используем initialFormState как основу для дефолтных значений
        ...formData,
        // Устанавливаем числовое значение для суммы (если пришла строка)
        sum: typeof formData.sum === 'string' ? parseFloat(formData.sum) : formData.sum,
        amount: typeof formData.sum === 'string' ? parseFloat(formData.sum) : formData.sum,
        // Синхронизируем старые и новые поля
        comment: formData.comment || formData.description || '',
        description: formData.description || formData.comment || '',
        category: formData.category || (formData.categoryId ? formData.categoryId.toString() : '0'),
        categoryId: formData.categoryId || (formData.category ? parseInt(formData.category) : 0),
        transactionType: formData.transactionType || formData.type || 'DEBIT',
        typeOperation: formData.typeOperation || formData.transactionType || formData.type || 'DEBIT',
        type: formData.type || formData.transactionType || 'DEBIT',
        // Гарантируем наличие обязательных полей DTO
        personType: formData.personType || PERSON_TYPE,
        inn: formData.inn || '000000000000',
        personTypeRecipient: formData.personTypeRecipient || PERSON_TYPE, 
        innRecipient: formData.innRecipient || '000000000000',
        nameBank: formData.nameBank || 'Сбербанк',
        nameBankRecip: formData.nameBankRecip || 'Сбербанк',
        billRecip: formData.billRecip || '40000000000000000000',
        rBillRecip: formData.rBillRecip || '40000000000000000000',
        // Устанавливаем правильную дату
        transactionDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      console.log('Отправляем данные транзакции:', dataToSubmit);
      
      if (isEditing && id) {
        await dispatch(updateTransaction({ id: Number(id), data: dataToSubmit })).unwrap();
        setSuccessMessage('Транзакция обновлена успешно');
      } else {
        await dispatch(createTransaction(dataToSubmit)).unwrap();
        setSuccessMessage('Транзакция создана успешно');
        // Reset form for new transaction
        setFormData(initialFormState as Transaction);
        setDate(new Date());
      }
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      console.error('Ошибка сохранения транзакции:', err);
      setErrorMessage('Ошибка сохранения транзакции');
    }
  };
  
  // Filter categories by type
  const filteredCategories = categories.filter(
    category => !formData.type || category.type === formData.type
  );
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const formControlVariants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      } 
    })
  };

  const buttonVariants = {
    initial: { scale: 0.9 },
    animate: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <Box 
      id="transaction-form-container"
      sx={{ 
        maxWidth: 800, 
        mx: 'auto',
        px: { xs: 2, md: 0 },
        position: 'relative',
        zIndex: 1500,
        visibility: 'visible !important',
        display: 'block !important',
        opacity: '1 !important',
        background: theme => theme.palette.background.default,
        minHeight: '100vh',
        pb: 10
      }}
    >
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        style={{ 
          position: 'relative',
          zIndex: 1500,
          visibility: 'visible',
          display: 'block',
          opacity: 1
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          mb: 4,
          mt: 2
        }}>
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              onClick={() => navigate('/transactions')}
              sx={{ 
                mr: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.default' } 
              }}
              size="large"
            >
              <ArrowBack />
            </IconButton>
          </motion.div>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isEditing ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </Typography>
        </Box>
        
        <Paper 
          elevation={6}
          sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 4,
            mb: 5,
            background: theme => `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            transition: 'all 0.3s ease-in-out',
            visibility: 'visible !important',
            display: 'block !important',
            opacity: '1 !important',
            position: 'relative',
            zIndex: 1500,
            '&:hover': {
              boxShadow: theme => `0 8px 32px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.3 : 0.1})`,
            }
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={0}
            >
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4
              }}>
                <ToggleButtonGroup
                  value={formData.transactionType}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      handleChange({
                        target: {
                          name: 'transactionType',
                          value: newValue
                        }
                      } as React.ChangeEvent<HTMLInputElement>);
                      
                      // Для совместимости обновляем также type
                      handleChange({
                        target: {
                          name: 'type',
                          value: newValue
                        }
                      } as React.ChangeEvent<HTMLInputElement>);
                      
                      // Обновляем typeOperation, так как оно должно совпадать с transactionType
                      handleChange({
                        target: {
                          name: 'typeOperation',
                          value: newValue
                        }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  color="primary"
                  fullWidth
                  sx={{ maxWidth: 400, mx: 'auto' }}
                >
                  <ToggleButton 
                    value="CREDIT" 
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '12px 0 0 12px',
                      color: 'success.main',
                      '&.Mui-selected': {
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'success.dark',
                        }
                      }
                    }}
                  >
                    <TrendingUp sx={{ mr: 1 }} />
                    Доход
                  </ToggleButton>
                  <ToggleButton 
                    value="DEBIT" 
                    sx={{ 
                      py: 1.5, 
                      borderRadius: '0 12px 12px 0',
                      color: 'error.main',
                      '&.Mui-selected': {
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark',
                        }
                      }
                    }}
                  >
                    <TrendingDown sx={{ mr: 1 }} />
                    Расход
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={1}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-amount-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Сумма
                </FormLabel>
                <TextField
                  id="transaction-amount"
                  name="sum"
                  type="number"
                  value={formData.sum}
                  onChange={(e) => {
                    handleChange(e);
                    // Для совместимости обновляем также amount
                    handleChange({
                      target: {
                        name: 'amount',
                        value: e.target.value
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₽</InputAdornment>
                    ),
                  }}
                  error={!!formErrors.sum}
                  helperText={formErrors.sum}
                />
              </FormControl>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={2}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-description-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Описание
                </FormLabel>
                <TextField
                  id="transaction-description"
                  name="comment"
                  value={formData.comment}
                  onChange={(e) => {
                    handleChange(e);
                    // Для совместимости обновляем также description
                    handleChange({
                      target: {
                        name: 'description',
                        value: e.target.value
                      }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  placeholder="Описание транзакции"
                  multiline
                  rows={3}
                  error={!!formErrors.comment}
                  helperText={formErrors.comment}
                />
              </FormControl>
            </motion.div>
            
            {/* ИНФОРМАЦИЯ ОТПРАВИТЕЛЕ */}
            <Typography variant="h6" sx={{ my: 2, fontWeight: 600 }}>
              Информация об отправителе
            </Typography>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={5}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-person-type-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Тип отправителя
                </FormLabel>
                <Select
                  id="transaction-person-type"
                  name="personType"
                  value={formData.personType}
                  onChange={handleChange as any}
                  displayEmpty
                >
                  <MenuItem value={PERSON_TYPE}>Физическое лицо</MenuItem>
                  <MenuItem value={LEGAL_TYPE}>Юридическое лицо</MenuItem>
                </Select>
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={6}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-name-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Имя отправителя
                </FormLabel>
                <TextField
                  id="transaction-name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  placeholder={formData.personType === PERSON_TYPE ? 'Иван Иванов' : 'ООО "Ромашка"'}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={7}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-inn-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  ИНН отправителя
                </FormLabel>
                <TextField
                  id="transaction-inn"
                  name="inn"
                  value={formData.inn}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder={formData.personType === PERSON_TYPE ? '123456789012' : '1234567890'}
                  error={!!formErrors.inn}
                  helperText={formErrors.inn || `ИНН должен содержать ${formData.personType === PERSON_TYPE ? '12' : '10'} цифр (обязательное поле)`}
                  inputProps={{
                    maxLength: formData.personType === PERSON_TYPE ? 12 : 10
                  }}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={8}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-address-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Адрес отправителя
                </FormLabel>
                <TextField
                  id="transaction-address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={9}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-phone-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Телефон отправителя
                </FormLabel>
                <TextField
                  id="transaction-phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    // Проверяем, что телефон начинается с +7 или 8 и содержит только цифры после
                    const value = e.target.value;
                    if (value === "" || value === "+7" || value === "8" || 
                        (/^(\+7|8)\d*$/.test(value) && value.length <= 12)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="+71234567890"
                  error={!!formErrors.phone}
                  helperText={formErrors.phone || 'Формат: +7XXXXXXXXXX или 8XXXXXXXXXX'}
                  inputProps={{
                    maxLength: 12
                  }}
                />
              </FormControl>
            </motion.div>
            
            {/* ИНФОРМАЦИЯ О ПОЛУЧАТЕЛЕ */}
            <Typography variant="h6" sx={{ my: 2, fontWeight: 600 }}>
              Информация о получателе
            </Typography>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={10}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-type-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Тип получателя
                </FormLabel>
                <Select
                  id="transaction-recipient-type"
                  name="personTypeRecipient"
                  value={formData.personTypeRecipient}
                  onChange={handleChange as any}
                  displayEmpty
                >
                  <MenuItem value={PERSON_TYPE}>Физическое лицо</MenuItem>
                  <MenuItem value={LEGAL_TYPE}>Юридическое лицо</MenuItem>
                </Select>
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={11}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-name-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Имя получателя
                </FormLabel>
                <TextField
                  id="transaction-recipient-name"
                  name="nameRecipient"
                  value={formData.nameRecipient || ''}
                  onChange={handleChange}
                  placeholder={formData.personTypeRecipient === PERSON_TYPE ? 'Иван Иванов' : 'ООО "Ромашка"'}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={12}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-inn-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  ИНН получателя
                </FormLabel>
                <TextField
                  id="transaction-recipient-inn"
                  name="innRecipient"
                  value={formData.innRecipient}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder={formData.personTypeRecipient === PERSON_TYPE ? '123456789012' : '1234567890'}
                  error={!!formErrors.innRecipient}
                  helperText={formErrors.innRecipient || `ИНН должен содержать ${formData.personTypeRecipient === PERSON_TYPE ? '12' : '10'} цифр (обязательное поле)`}
                  inputProps={{
                    maxLength: formData.personTypeRecipient === PERSON_TYPE ? 12 : 10
                  }}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={13}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-address-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Адрес получателя
                </FormLabel>
                <TextField
                  id="transaction-recipient-address"
                  name="addressRecipient"
                  value={formData.addressRecipient || ''}
                  onChange={handleChange}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={14}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-phone-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Телефон получателя
                </FormLabel>
                <TextField
                  id="transaction-recipient-phone"
                  name="recipientPhoneRecipient"
                  value={formData.recipientPhoneRecipient || ''}
                  onChange={(e) => {
                    // Проверяем, что телефон начинается с +7 или 8 и содержит только цифры после
                    const value = e.target.value;
                    if (value === "" || value === "+7" || value === "8" || 
                        (/^(\+7|8)\d*$/.test(value) && value.length <= 12)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="+71234567890"
                  error={!!formErrors.recipientPhoneRecipient}
                  helperText={formErrors.recipientPhoneRecipient || 'Формат: +7XXXXXXXXXX или 8XXXXXXXXXX'}
                  inputProps={{
                    maxLength: 12
                  }}
                />
              </FormControl>
            </motion.div>
            
            {/* ИНФОРМАЦИЯ О БАНКАХ */}
            <Typography variant="h6" sx={{ my: 2, fontWeight: 600 }}>
              Банковская информация
            </Typography>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={15}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-bank-name-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Банк отправителя
                </FormLabel>
                <TextField
                  id="transaction-bank-name"
                  name="nameBank"
                  value={formData.nameBank}
                  onChange={handleChange}
                  placeholder="Сбербанк"
                  error={!!formErrors.nameBank}
                  helperText={formErrors.nameBank}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={16}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-bill-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Основной счет отправителя
                </FormLabel>
                <TextField
                  id="transaction-bill"
                  name="bill"
                  value={formData.bill || ''}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="40702810123450101230"
                  error={!!formErrors.bill}
                  helperText={formErrors.bill || 'Счет должен содержать 20 цифр'}
                  inputProps={{
                    maxLength: 20
                  }}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={17}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-rbill-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Расчетный счет отправителя
                </FormLabel>
                <TextField
                  id="transaction-rbill"
                  name="rBill"
                  value={formData.rBill || ''}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="40702810123450101230"
                  error={!!formErrors.rBill}
                  helperText={formErrors.rBill || 'Счет должен содержать 20 цифр'}
                  inputProps={{
                    maxLength: 20
                  }}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={18}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-recipient-bank-name-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Банк получателя
                </FormLabel>
                <TextField
                  id="transaction-recipient-bank-name"
                  name="nameBankRecip"
                  value={formData.nameBankRecip}
                  onChange={handleChange}
                  placeholder="Альфа-Банк"
                  error={!!formErrors.nameBankRecip}
                  helperText={formErrors.nameBankRecip}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={19}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-bill-recip-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Основной счет получателя
                </FormLabel>
                <TextField
                  id="transaction-bill-recip"
                  name="billRecip"
                  value={formData.billRecip}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="40702810123450101230"
                  error={!!formErrors.billRecip}
                  helperText={formErrors.billRecip || 'Счет должен содержать 20 цифр (обязательное поле)'}
                  inputProps={{
                    maxLength: 20
                  }}
                />
              </FormControl>
            </motion.div>
            
            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={20}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-rbill-recip-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Расчетный счет получателя
                </FormLabel>
                <TextField
                  id="transaction-rbill-recip"
                  name="rBillRecip"
                  value={formData.rBillRecip}
                  onChange={(e) => {
                    // Проверяем, что введены только цифры
                    if (/^\d*$/.test(e.target.value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="40702810123450101230"
                  error={!!formErrors.rBillRecip}
                  helperText={formErrors.rBillRecip || 'Счет должен содержать 20 цифр (обязательное поле)'}
                  inputProps={{
                    maxLength: 20
                  }}
                />
              </FormControl>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={3}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-date-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Дата
                </FormLabel>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={date}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.transactionDate,
                        helperText: formErrors.transactionDate,
                      },
                    }}
                  />
                </LocalizationProvider>
              </FormControl>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={4}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-category-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Категория
                </FormLabel>
                <Select
                  id="transaction-category"
                  name="category"
                  value={formData.category || ''}
                  onChange={(e) => {
                    // Явно типизируем e как React.ChangeEvent с нужной структурой
                    const event = {
                      target: {
                        name: 'category',
                        value: e.target.value
                      }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleChange(event);
                    
                    // Для совместимости обновляем также categoryId
                    const categoryIdEvent = {
                      target: {
                        name: 'categoryId',
                        value: parseInt(e.target.value as string) || 0
                      }
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleChange(categoryIdEvent);
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Выберите категорию</Typography>;
                    }
                    const category = categories.find((cat) => cat.id && cat.id.toString() === selected);
                    return category ? category.name : 'Без категории';
                  }}
                  error={!!formErrors.category}
                >
                  <MenuItem value="">
                    <em>Без категории</em>
                  </MenuItem>
                  {categories
                    .filter((category) => category.type === formData.transactionType)
                    .map((category) => (
                      <MenuItem key={category.id || 0} value={category.id ? category.id.toString() : '0'}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText error>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={6}
              style={{ marginTop: '20px' }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ 
                  mt: 4,
                  justifyContent: 'space-between'
                }}
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/transactions')}
                    startIcon={<ArrowBack />}
                    sx={{ 
                      borderRadius: 3, 
                      px: 4,
                      py: 1.5,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Назад
                  </Button>
                </motion.div>
                
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? <Save /> : <Add />)}
                    disabled={loading}
                    sx={{ 
                      borderRadius: 3, 
                      px: 4,
                      py: 1.5,
                      width: { xs: '100%', sm: 'auto' },
                      background: theme => theme.palette.mode === 'light' 
                        ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                        : 'linear-gradient(45deg, #4a148c 30%, #7c43bd 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                        background: theme => theme.palette.mode === 'light'
                          ? 'linear-gradient(45deg, #1976D2 30%, #00b0ff 90%)'
                          : 'linear-gradient(45deg, #38006b 30%, #6a1b9a 90%)',
                      }
                    }}
                  >
                    {isEditing ? 'Сохранить' : 'Создать транзакцию'}
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionForm;
