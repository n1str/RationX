import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  TrendingUp,
  TrendingDown,
  ReceiptLong,
  FilterAlt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchAllTransactions,
  fetchTransactionsByType,
  fetchTransactionsByStatus,
  fetchTransactionsByCategory,
  deleteTransaction,
  setFilters,
  clearFilters,
} from '../../store/slices/transactionsSlice';
import { fetchAllCategories } from '../../store/slices/categoriesSlice';
import { Transaction } from '../../services/transactionService';
import TransactionsFilter from '../../components/transactions/TransactionsFilter';

// Определение типа для фильтров транзакций
interface TransactionFilters {
  type?: string;
  status?: string;
  categoryId?: number;
  fromDate?: Date | null;
  toDate?: Date | null;
  minAmount?: number | null;
  maxAmount?: number | null;
}

// Format number as currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const TransactionsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { items: transactions, loading, filters } = useAppSelector(state => state.transactions);
  const { items: categories } = useAppSelector(state => state.categories);
  
  // Local state for UI
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllTransactions());
    dispatch(fetchAllCategories());
  }, [dispatch]);
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle delete transaction
  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(searchTermLower) ||
      transaction.recipientName?.toLowerCase().includes(searchTermLower) ||
      transaction.recipientBank?.toLowerCase().includes(searchTermLower) ||
      transaction.amount.toString().includes(searchTermLower)
    );
  });
  
  // Apply pagination
  const paginatedTransactions = filteredTransactions
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Get status chip color
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Транзакции
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/transactions/new')}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Новая транзакция
        </Button>
      </Box>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper sx={{ mb: 3, p: 2, borderRadius: 3 }}>
          <Stack spacing={2} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск транзакций..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            <Stack direction="row" spacing={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ borderRadius: 2, mr: 1 }}
              >
                Фильтры
              </Button>
              <Button
                variant="text"
                disabled={Object.keys(filters).length === 0}
                onClick={() => dispatch(clearFilters())}
                sx={{ borderRadius: 2 }}
              >
                Сбросить фильтры
              </Button>
            </Stack>
          </Stack>
          
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Фильтры транзакций
              </Typography>
              <TransactionsFilter 
                onApplyFilters={(filters: TransactionFilters) => {
                  dispatch(setFilters(filters));
                  setShowFilters(false);
                }}
                categories={categories}
                currentFilters={filters}
              />
            </Box>
          )}
        </Paper>
        
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <ReceiptLong sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Транзакции не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Не найдено транзакций, соответствующих текущим критериям фильтрации.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<FilterAlt />} 
                onClick={() => dispatch(clearFilters())}
                sx={{ mt: 1 }}
              >
                Сбросить фильтры
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell>Тип</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Категория</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => {
                      const category = categories.find(cat => cat.id === transaction.categoryId);
                      return (
                        <TableRow
                          key={transaction.id}
                          hover
                          onClick={() => navigate(`/transactions/${transaction.id}`)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              bgcolor: 'action.hover',
                            },
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: transaction.type === 'DEBIT' ? 'error.main' : 'success.main',
                              }}
                            >
                              {transaction.type === 'DEBIT' ? <TrendingDown /> : <TrendingUp />}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.recipientName || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {category?.name || 'Без категории'}
                          </TableCell>
                          <TableCell>
                            {formatDate(transaction.transactionDate)}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              sx={{ 
                                color: transaction.type === 'DEBIT' ? 'error.main' : 'success.main',
                                fontWeight: 600,
                              }}
                            >
                              {transaction.type === 'DEBIT' ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.status} 
                              size="small"
                              color={getStatusChipColor(transaction.status) as any}
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Tooltip title="Редактировать">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/transactions/${transaction.id}/edit`);
                                  }}
                                  size="small"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Удалить">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTransaction(transaction.id!);
                                  }}
                                  size="small"
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default TransactionsList;
