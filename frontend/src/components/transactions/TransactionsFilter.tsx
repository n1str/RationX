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
    status: currentFilters.status || '',
    categoryId: currentFilters.categoryId || '',
    dateFrom: currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : null,
    dateTo: currentFilters.dateTo ? new Date(currentFilters.dateTo) : null,
    amountMin: currentFilters.amountMin || '',
    amountMax: currentFilters.amountMax || '',
  });

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
    const formattedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
      dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
      categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
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

    onApplyFilters(formattedFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      status: '',
      categoryId: '',
      dateFrom: null,
      dateTo: null,
      amountMin: '',
      amountMax: '',
    });
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Filter Transactions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="type-label">Transaction Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              name="type"
              value={filters.type}
              label="Transaction Type"
              onChange={handleSelectChange}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="DEBIT">Expense</MenuItem>
              <MenuItem value="CREDIT">Income</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={filters.status}
              label="Status"
              onChange={handleSelectChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="categoryId"
              name="categoryId"
              value={filters.categoryId}
              label="Category"
              onChange={handleSelectChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="From Date"
              value={filters.dateFrom}
              onChange={(date) => handleDateChange('dateFrom', date)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </LocalizationProvider>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="To Date"
              value={filters.dateTo}
              onChange={(date) => handleDateChange('dateTo', date)}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </LocalizationProvider>
          
          <TextField
            fullWidth
            label="Min Amount"
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
            label="Max Amount"
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
            Reset
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleApplyFilters}
            sx={{ borderRadius: 2 }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TransactionsFilter;
