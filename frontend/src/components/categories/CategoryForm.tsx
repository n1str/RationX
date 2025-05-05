import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Category } from '../../services/categoryService';
import {
  createCategory,
  updateCategory,
  fetchCategoryById,
  clearSelectedCategory,
  clearError,
} from '../../store/slices/categoriesSlice';

const initialFormState: Category = {
  name: '',
  type: 'DEBIT',
  description: '',
  iconUrl: '',
};

interface FormErrors {
  name?: string;
  type?: string;
}

const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedCategory, loading, error } = useAppSelector(state => state.categories);
  
  const [formData, setFormData] = useState<Category>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch category data if editing
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchCategoryById(Number(id)));
    }
    
    // Clear any existing errors
    dispatch(clearError());
    
    return () => {
      dispatch(clearSelectedCategory());
    };
  }, [dispatch, isEditing, id]);
  
  // Set form data when editing
  useEffect(() => {
    if (isEditing && selectedCategory) {
      console.log('Загружена категория для редактирования:', selectedCategory);
      setFormData(selectedCategory);
    }
  }, [isEditing, selectedCategory]);
  
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
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Название категории обязательно';
      isValid = false;
    }
    
    if (!formData.type) {
      errors.type = 'Тип категории обязателен';
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
    
    // Сбрасываем сообщения
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      console.log('Отправка формы категории:', formData);
      
      if (isEditing && id) {
        console.log(`Обновление существующей категории с ID=${id}:`, formData);
        const result = await dispatch(updateCategory({ id: Number(id), data: formData })).unwrap();
        console.log('Результат обновления категории:', result);
        setSuccessMessage('Категория успешно обновлена');
      } else {
        console.log('Создание новой категории:', formData);
        const result = await dispatch(createCategory(formData)).unwrap();
        console.log('Результат создания категории:', result);
        setSuccessMessage('Категория успешно создана');
        // Reset form for new category
        setFormData(initialFormState);
      }
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err: any) {
      console.error('Ошибка при сохранении категории:', err);
      
      // Отображаем сообщение об ошибке
      if (err.response?.data?.error) {
        setErrorMessage(err.response.data.error);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Произошла ошибка при сохранении категории');
      }
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <Box>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/categories')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isEditing ? 'Редактировать категорию' : 'Добавить новую категорию'}
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Сведения о категории
                </Typography>
                <Divider sx={{ my: 1 }} />
              </Box>
              
              <Box>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="Название категории"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Box>
              
              <Box>
                <FormControl fullWidth variant="outlined" error={!!formErrors.type}>
                  <InputLabel id="type-label">Тип категории</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange as any}
                    label="Тип категории"
                  >
                    <MenuItem value="DEBIT">Расход</MenuItem>
                    <MenuItem value="CREDIT">Доход</MenuItem>
                  </Select>
                  {formErrors.type && (
                    <FormHelperText>{formErrors.type}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Описание (опционально)"
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </Box>
              
              <Box>
                <TextField
                  fullWidth
                  id="iconUrl"
                  name="iconUrl"
                  label="URL иконки (опционально)"
                  value={formData.iconUrl || ''}
                  onChange={handleChange}
                />
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/categories')}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </motion.div>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Уведомление об ошибке */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage('')}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryForm;
