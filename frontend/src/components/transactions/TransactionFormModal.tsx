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
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { 
  createTransaction, 
  updateTransaction, 
  fetchTransactionById,
  clearSelectedTransaction,
  fetchAllTransactions
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Фильтруем категории в зависимости от типа транзакции
  const filteredCategories = Array.isArray(categories) ? categories.filter(
    category => category.type === formData.type
  ) : [];
  
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
    
    setIsSaving(true);
    
    try {
      if (isEditing && id) {
        await dispatch(updateTransaction({ id: Number(id), data: formData })).unwrap();
      } else {
        await dispatch(createTransaction(formData)).unwrap();
      }
      
      // Сразу перенаправляем на страницу транзакций
      handleClose();
    } catch (err) {
      console.error('Ошибка сохранения транзакции:', err);
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isSaving ? undefined : handleClose}
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isSaving}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 6,
          overflow: 'hidden'
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
          <Typography variant="h6">
            {isEditing ? 'Редактировать транзакцию' : 'Новая транзакция'}
          </Typography>
          {!isSaving && (
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleClose}
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
              justifyContent: 'center',
              mb: 3,
              mt: 1
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
                size="medium"
                sx={{ maxWidth: 350 }}
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
            </Box>
            
            <Stack spacing={2.5}>
              <FormControl fullWidth>
                <TextField
                  id="transaction-amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₽</InputAdornment>
                    ),
                  }}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Описание транзакции"
                  multiline
                  rows={2}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
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
                  onChange={handleChange as any}
                  label="Категория"
                  size="medium"
                  variant="outlined"
                  disabled={isSaving}
                >
                  <MenuItem value="">
                    <em>Выберите категорию</em>
                  </MenuItem>
                  {Array.isArray(filteredCategories) && filteredCategories.length > 0 
                    ? filteredCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                    : categoriesLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Загрузка...
                      </MenuItem>
                    ) : (
                      <MenuItem disabled>
                        Нет категорий для данного типа
                      </MenuItem>
                    )}
                </Select>
                {formErrors.categoryId && (
                  <FormHelperText error>{formErrors.categoryId}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="transaction-status-label">Статус</InputLabel>
                <Select
                  labelId="transaction-status-label"
                  id="transaction-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange as any}
                  label="Статус"
                  size="medium"
                  variant="outlined"
                  disabled={isSaving}
                >
                  <MenuItem value="COMPLETED">Завершено</MenuItem>
                  <MenuItem value="PENDING">В ожидании</MenuItem>
                  <MenuItem value="CANCELLED">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
          
          {isSaving && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, pt: 0, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ minWidth: 100 }}
            disabled={isSaving}
          >
            Отмена
          </Button>
          
          <Button
            variant="contained"
            onClick={(e) => handleSubmit(e as any)}
            color="primary"
            disabled={isSaving}
            sx={{ minWidth: 120 }}
          >
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TransactionFormModal;
