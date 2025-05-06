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
  Divider,
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
import TransactionsFilter from './TransactionsFilter';

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
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Не указана';
  
  try {
    const date = new Date(dateString);
    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return 'Не указана';
    }
    
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Ошибка при форматировании даты:', dateString, error);
    return 'Не указана';
  }
};

// Функция для получения категории по идентификатору с исправленным сравнением
const getCategoryById = (categoryId: string | number | undefined, categoriesList: any[]): any => {
  if (!categoryId || !Array.isArray(categoriesList)) return null;
  
  // Приводим ID категории к строке для сравнения
  const categoryIdStr = String(categoryId);
  return categoriesList.find(c => String(c.id) === categoryIdStr);
};

// Используем React.memo для предотвращения лишних рендеров
const TransactionRow = React.memo(({ 
  transaction, 
  category, 
  navigate, 
  handleDeleteTransaction 
}: { 
  transaction: Transaction; 
  category: any;
  navigate: any;
  handleDeleteTransaction: (id: number) => void;
}) => {
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
            color: transaction.type === 'CREDIT' ? 'error.main' : 'success.main',
          }}
        >
          {transaction.type === 'CREDIT' ? <TrendingDown /> : <TrendingUp />}
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
        {transaction.transactionDate ? formatDate(transaction.transactionDate) : 'Нет даты'}
      </TableCell>
      <TableCell>
        <Typography 
          sx={{ 
            color: transaction.type === 'CREDIT' ? 'error.main' : 'success.main',
            fontWeight: 600,
          }}
        >
          {transaction.type === 'CREDIT' ? '-' : '+'}
          {transaction.amount ? formatCurrency(transaction.amount) : '₽0'}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip 
          label={transaction.status || 'Неизвестно'} 
          size="small"
          color={(transaction.status ? 
            (transaction.status === 'COMPLETED' ? 'success' : 
             transaction.status === 'PENDING' ? 'warning' : 
             transaction.status === 'FAILED' ? 'error' : 'default') 
            : 'default') as any}
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
});

const TransactionsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { items: transactions = [], loading, filters } = useAppSelector(state => state.transactions);
  const { items: categories = [] } = useAppSelector(state => state.categories);
  
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
  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter(transaction => {
        if (!transaction) return false;
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (transaction.description || '').toLowerCase().includes(searchTermLower) ||
          (transaction.recipientName || '').toLowerCase().includes(searchTermLower) ||
          (transaction.nameBankRecip || '').toLowerCase().includes(searchTermLower) ||
          (transaction.amount?.toString() || '').includes(searchTermLower)
        );
      })
    : [];
  
  // Apply pagination
  const paginatedTransactions = filteredTransactions
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      mx: 'auto'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2.5,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Транзакции
          {Array.isArray(filteredTransactions) && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({filteredTransactions.length})
            </Typography>
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/transactions/new')}
          sx={{ 
            borderRadius: 1, 
            px: 2, 
            py: 0.75,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Новая транзакция
        </Button>
      </Box>
      
      <Paper sx={{ 
        mb: 2.5, 
        p: { xs: 1.5, sm: 2 }, 
        borderRadius: 1.5 
      }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Поиск транзакций..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              alignItems: { xs: 'stretch', sm: 'center' }
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ 
                borderRadius: 1,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Фильтры
            </Button>
            <Button
              variant="text"
              disabled={Object.keys(filters).length === 0}
              onClick={() => dispatch(clearFilters())}
              sx={{ 
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Сбросить фильтры
            </Button>
          </Stack>
        </Stack>
        
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
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
      
      <Paper sx={{ 
        borderRadius: 1.5, 
        overflow: 'hidden',
        width: '100%',
        overflowX: 'auto'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : Array.isArray(filteredTransactions) && filteredTransactions.length > 0 ? (
          <>
            <TableContainer>
              <Table 
                size="medium"
                sx={{
                  minWidth: '750px'
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">Тип</TableCell>
                    <TableCell width="30%">Описание</TableCell>
                    <TableCell width="20%">Категория</TableCell>
                    <TableCell width="15%">Дата</TableCell>
                    <TableCell width="15%">Сумма</TableCell>
                    <TableCell width="10%">Статус</TableCell>
                    <TableCell width="5%" align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransactions.map((transaction) => {
                    const category = getCategoryById(transaction?.categoryId, categories);
                    
                    return (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        category={category}
                        navigate={navigate}
                        handleDeleteTransaction={handleDeleteTransaction}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={filteredTransactions.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ borderTop: 1, borderColor: 'divider' }}
            />
          </>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              p: 5,
              textAlign: 'center'
            }}
          >
            <ReceiptLong sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Транзакции не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Не найдено транзакций, соответствующих текущим критериям фильтрации.
            </Typography>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="outlined"
                startIcon={<FilterAlt />}
                onClick={() => dispatch(clearFilters())}
              >
                Сбросить фильтры
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default React.memo(TransactionsList);
