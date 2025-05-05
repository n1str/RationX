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
  fetchAllCategories
} from '../../store/slices/categoriesSlice';
import { Transaction } from '../../services/transactionService';

const initialFormState: Transaction = {
  amount: 0,
  description: '',
  transactionDate: new Date().toISOString().split('T')[0],
  categoryId: 0,
  type: 'DEBIT',
  status: 'COMPLETED',
  recipientName: '',
  recipientInn: '',
  recipientBank: '',
};

interface FormValues {
  type: Transaction['type'];
  amount: number;
  description: string;
  transactionDate: string;
  categoryId: number | null;
  status: Transaction['status'];
  notes?: string;
  recipientName?: string;
  recipientInn?: string;
  recipientBank?: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  transactionDate?: string;
  categoryId?: string;
  status?: string;
  type?: string;
}

const TransactionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedTransaction, loading, error } = useAppSelector(state => state.transactions);
  const { items: categories, loading: categoriesLoading } = useAppSelector(state => state.categories);
  
  const [formData, setFormData] = useState<Transaction>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [date, setDate] = useState<Date | null>(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch data
  useEffect(() => {
    dispatch(fetchAllCategories());
    
    if (isEditing && id) {
      dispatch(fetchTransactionById(Number(id)));
    }
    
    return () => {
      dispatch(clearSelectedTransaction());
    };
  }, [dispatch, isEditing, id]);
  
  // Set form data when editing
  useEffect(() => {
    if (isEditing && selectedTransaction) {
      setFormData(selectedTransaction);
      setDate(new Date(selectedTransaction.transactionDate));
    }
  }, [isEditing, selectedTransaction]);
  
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
      setFormData(prev => ({
        ...prev,
        transactionDate: formattedDate,
      }));
      
      // Clear date error
      if (formErrors.transactionDate) {
        setFormErrors(prev => ({
          ...prev,
          transactionDate: undefined,
        }));
      }
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Сумма должна быть больше 0';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Описание обязательно';
      isValid = false;
    }
    
    if (!formData.transactionDate) {
      errors.transactionDate = 'Дата обязательна';
      isValid = false;
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Категория обязательна';
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
      if (isEditing && id) {
        await dispatch(updateTransaction({ id: Number(id), data: formData })).unwrap();
        setSuccessMessage('Транзакция обновлена успешно');
      } else {
        await dispatch(createTransaction(formData)).unwrap();
        setSuccessMessage('Транзакция создана успешно');
        // Reset form for new transaction
        setFormData(initialFormState);
        setDate(new Date());
      }
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/transactions');
      }, 1500);
    } catch (err) {
      console.error('Ошибка сохранения транзакции:', err);
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
                  value={formData.type}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      handleChange({
                        target: {
                          name: 'type',
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
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₽</InputAdornment>
                    ),
                  }}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
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
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Описание транзакции"
                  multiline
                  rows={3}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
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
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={handleChange as any}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography color="text.secondary">Выберите категорию</Typography>;
                    }
                    const category = categories.find((cat) => cat.id === selected);
                    return category ? category.name : 'Без категории';
                  }}
                  error={!!formErrors.categoryId}
                >
                  <MenuItem value="">
                    <em>Без категории</em>
                  </MenuItem>
                  {categories
                    .filter((category) => category.type === formData.type)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
                {formErrors.categoryId && (
                  <FormHelperText error>{formErrors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </motion.div>

            <motion.div
              initial="initial"
              animate="animate"
              variants={formControlVariants}
              custom={5}
            >
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel
                  id="transaction-status-label"
                  sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                >
                  Статус
                </FormLabel>
                <Select
                  id="transaction-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange as any}
                  displayEmpty
                  error={!!formErrors.status}
                >
                  <MenuItem value="COMPLETED">Завершено</MenuItem>
                  <MenuItem value="PENDING">В ожидании</MenuItem>
                  <MenuItem value="CANCELLED">Отменено</MenuItem>
                </Select>
                {formErrors.status && (
                  <FormHelperText error>{formErrors.status}</FormHelperText>
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
