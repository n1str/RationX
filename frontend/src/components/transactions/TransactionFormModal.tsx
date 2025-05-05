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
  useTheme
} from '@mui/material';
import {
  Close,
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

interface FormErrors {
  amount?: string;
  description?: string;
  transactionDate?: string;
  categoryId?: string;
  status?: string;
  type?: string;
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
  
  // Handle close
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      navigate('/transactions');
    }, 300);
  };
  
  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setDate(newDate);
      setFormData({
        ...formData,
        transactionDate: newDate.toISOString().split('T')[0]
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
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
  
  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        setFormData(initialFormState);
        setDate(new Date());
      }
      
      // Navigate back after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Ошибка сохранения транзакции:', err);
    }
  };
  
  // Filter categories by type
  const filteredCategories = categories.filter(
    category => !formData.type || category.type === formData.type
  );
  
  const transitionVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 }
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
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: 24,
          p: 2,
          background: theme => theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        }
      }}
      TransitionProps={{
        component: motion.div,
        variants: transitionVariants,
        initial: "initial",
        animate: "animate",
        exit: "exit"
      } as any}
      sx={{ 
        zIndex: 9999,
        visibility: 'visible !important'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <DialogTitle sx={{ 
          p: 3, 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h5" fontWeight={700}>
            {isEditing ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            component={motion.button}
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 2 }}>
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
                mb: 4,
                mt: 2
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
            
            <Stack spacing={3}>
              <motion.div
                initial="initial"
                animate="animate"
                variants={formControlVariants}
                custom={1}
              >
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="transaction-amount-label">Сумма</InputLabel>
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
                    label="Сумма"
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
                    label="Описание"
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
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <DatePicker
                      label="Дата транзакции"
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
                <FormControl fullWidth sx={{ mb: 3 }} error={!!formErrors.categoryId}>
                  <InputLabel id="transaction-category-label">Категория</InputLabel>
                  <Select
                    labelId="transaction-category-label"
                    id="transaction-category"
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={handleChange as any}
                    label="Категория"
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <Typography color="text.secondary">Выберите категорию</Typography>;
                      }
                      const category = categories.find((cat) => cat.id === selected);
                      return category ? category.name : 'Без категории';
                    }}
                  >
                    <MenuItem value="">
                      <em>Без категории</em>
                    </MenuItem>
                    {filteredCategories
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
                  <InputLabel id="transaction-status-label">Статус</InputLabel>
                  <Select
                    labelId="transaction-status-label"
                    id="transaction-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange as any}
                    label="Статус"
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
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Отмена
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              onClick={(e) => handleSubmit(e as any)}
              sx={{ 
                borderRadius: 2, 
                px: 3,
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                  : 'linear-gradient(45deg, #4a148c 30%, #7c43bd 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? <Save /> : <Add />)}
            >
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </motion.div>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TransactionFormModal;
