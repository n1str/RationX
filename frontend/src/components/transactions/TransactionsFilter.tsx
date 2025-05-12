import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Category } from '../../services/categoryService';

interface TransactionsFilterProps {
  onApplyFilters: (filters: any) => void;
  categories: Category[];
  currentFilters: any;
}

const TransactionsFilter: React.FC<TransactionsFilterProps> = ({
  onApplyFilters,
  categories,
  currentFilters,
}) => {
  const [filters, setFilters] = useState({
    type: currentFilters.type || '',
    categoryId: currentFilters.categoryId || '',
    dateFrom: currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : null,
    dateTo: currentFilters.dateTo ? new Date(currentFilters.dateTo) : null,
    amountMin: currentFilters.amountMin || '',
    amountMax: currentFilters.amountMax || '',
  });

  // Когда компонент монтируется, запоминаем исходные фильтры
  useEffect(() => {
    console.log('Получены текущие фильтры:', currentFilters);
    setFilters({
      type: currentFilters.type || '',
      categoryId: currentFilters.categoryId || '',
      dateFrom: currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : null,
      dateTo: currentFilters.dateTo ? new Date(currentFilters.dateTo) : null,
      amountMin: currentFilters.amountMin || '',
      amountMax: currentFilters.amountMax || '',
    });
  }, [currentFilters]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFilters({ ...filters, [field]: date });
  };

  const handleApplyFilters = () => {
    console.log('Применяем фильтры, текущие значения:', filters);
    const formattedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
      dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
      categoryId: filters.categoryId ? String(filters.categoryId) : undefined,
      amountMin: filters.amountMin ? Number(filters.amountMin) : undefined,
      amountMax: filters.amountMax ? Number(filters.amountMax) : undefined,
    };

    // Remove empty filters
    Object.keys(formattedFilters).forEach((key) => {
      if (formattedFilters[key as keyof typeof formattedFilters] === '' || 
          formattedFilters[key as keyof typeof formattedFilters] === undefined) {
        delete formattedFilters[key as keyof typeof formattedFilters];
      }
    });

    console.log('Отформатированные фильтры для применения:', formattedFilters);
    onApplyFilters(formattedFilters);
  };

  const handleResetFilters = () => {
    console.log('Сбрасываем фильтры');
    const resetFilters = {
      type: '',
      categoryId: '',
      dateFrom: null,
      dateTo: null,
      amountMin: '',
      amountMax: '',
    };
    setFilters(resetFilters);
    // Сразу применяем сброшенные фильтры
    onApplyFilters({});
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Фильтрация транзакций
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="type-label">Тип транзакции</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              name="type"
              value={filters.type}
              label="Тип транзакции"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Все типы</MenuItem>
              <MenuItem value="CREDIT">Доход</MenuItem>
              <MenuItem value="DEBIT">Расход</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="category-label">Категория</InputLabel>
            <Select
              labelId="category-label"
              id="categoryId"
              name="categoryId"
              value={filters.categoryId}
              label="Категория"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Все категории</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="С даты"
              value={filters.dateFrom}
              onChange={(date) => handleDateChange('dateFrom', date)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </LocalizationProvider>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="По дату"
              value={filters.dateTo}
              onChange={(date) => handleDateChange('dateTo', date)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </LocalizationProvider>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Мин. сумма"
            name="amountMin"
            type="number"
            size="small"
            value={filters.amountMin}
            onChange={handleChange}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          
          <TextField
            fullWidth
            label="Макс. сумма"
            name="amountMax"
            type="number"
            size="small"
            value={filters.amountMax}
            onChange={handleChange}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
        </Stack>
        
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleResetFilters}
            sx={{ mr: 2, borderRadius: 2 }}
          >
            Сбросить
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleApplyFilters}
            sx={{ borderRadius: 2 }}
          >
            Применить
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TransactionsFilter;
