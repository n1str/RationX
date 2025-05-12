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
  fetchTransactionsByCategory,
  deleteTransaction,
  setFilters,
  clearFilters,
} from '../../store/slices/transactionsSlice';
import { fetchAllCategories } from '../../store/slices/categoriesSlice';
import { Transaction } from '../../services/transactionService';
import TransactionsFilter from './TransactionsFilter';
import TransactionDetailsModal from './TransactionDetailsModal';

// Определение типа для фильтров транзакций
interface TransactionFilters {
  type?: string;
  status?: string;
  categoryId?: string;
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
  if (!categoryId || !Array.isArray(categoriesList) || categoriesList.length === 0) return null;
  
  // Для отладки
  console.log('Ищем категорию с ID/Name:', categoryId, 'Типа:', typeof categoryId);
  
  try {
    // Приводим ID категории к строке для сравнения
    const categoryIdStr = String(categoryId);
    
    // Сначала пробуем найти по точному совпадению ID
    let foundCategory = categoriesList.find(c => String(c.id) === categoryIdStr);
    
    // Если не нашли по ID, пробуем поискать по полю name (если categoryId - это название)
    if (!foundCategory) {
      foundCategory = categoriesList.find(c => 
        (typeof c.name === 'string') && 
        (typeof categoryId === 'string') && 
        c.name.toLowerCase() === categoryId.toLowerCase()
      );
    }
    
    // Если не нашли никак, пытаемся найти категорию с тем же ID но в другом типе данных
    if (!foundCategory) {
      const categoryIdNum = parseInt(categoryIdStr);
      if (!isNaN(categoryIdNum)) {
        foundCategory = categoriesList.find(c => Number(c.id) === categoryIdNum);
      }
    }
    
    // Для отладки
    console.log('Результат поиска категории:', foundCategory);
    
    return foundCategory;
  } catch (error) {
    console.error('Ошибка при поиске категории:', error);
    return null;
  }
};

// Используем React.memo для предотвращения лишних рендеров
const TransactionRow = React.memo(({ 
  transaction, 
  category, 
  navigate, 
  handleDeleteTransaction,
  onViewDetails
}: { 
  transaction: Transaction; 
  category: any;
  navigate: any;
  handleDeleteTransaction: (id: number) => void;
  onViewDetails: (id: number) => void;
}) => {
  return (
    <TableRow
      key={transaction.id}
      hover
      onClick={() => onViewDetails(transaction.id || 0)}
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
            color: transaction.type === 'CREDIT' ? 'success.main' : 'error.main',
          }}
        >
          {transaction.type === 'CREDIT' ? <TrendingUp /> : <TrendingDown />}
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
        <Typography variant="body2">
          {category?.name || (transaction.categoryId ? `Категория №${transaction.categoryId}` : 'Без категории')}
        </Typography>
      </TableCell>
      <TableCell>
        {transaction.transactionDate ? formatDate(transaction.transactionDate) : 'Нет даты'}
      </TableCell>
      <TableCell>
        <Typography 
          sx={{ 
            color: transaction.type === 'CREDIT' ? 'success.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          {transaction.type === 'CREDIT' ? '+' : '-'}
          {transaction.amount ? formatCurrency(Math.abs(transaction.amount)) : '₽0'}
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { items: transactions = [], loading, filters } = useAppSelector((state: any) => state.transactions);
  const { items: categories = [] } = useAppSelector((state: any) => state.categories);
  
  // Local state for UI
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Состояние для модального окна с деталями транзакции
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllTransactions());
    dispatch(fetchAllCategories());
  }, [dispatch]);
  
  // Эффект для отладки фильтров
  useEffect(() => {
    console.log('Текущие фильтры:', filters);
  }, [filters]);
  
  // Эффект для отладки данных транзакций и категорий
  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      console.log('Данные транзакций:', transactions);
      console.log('Данные категорий:', categories);
      
      // Проверка соответствия между ID категорий в транзакциях и категориями
      transactions.forEach((transaction: Transaction) => {
        const category = getCategoryById(transaction.categoryId, categories);
        console.log(
          `Транзакция ${transaction.id}: categoryId = ${transaction.categoryId}, ` + 
          `category = ${transaction.category}, найденная категория:`, 
          category
        );
      });
    }
  }, [transactions, categories]);
  
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
        
        // Проверяем основное условие поиска по тексту
        const matchesSearchTerm = (
          (transaction.description || '').toLowerCase().includes(searchTermLower) ||
          (transaction.recipientName || '').toLowerCase().includes(searchTermLower) ||
          (transaction.nameBankRecip || '').toLowerCase().includes(searchTermLower) ||
          (transaction.amount?.toString() || '').includes(searchTermLower)
        );
        
        // Проверяем фильтры
        const matchesTypeFilter = !filters.type || transaction.type === filters.type;
        
        // Проверка по категории - поиск по ID категории
        let matchesCategoryFilter = true;
        if (filters.categoryId) {
          // Получаем выбранную категорию по ID из фильтра
          const selectedCategory = categories.find((cat: any) => String(cat.id) === String(filters.categoryId));
          
          if (!selectedCategory) {
            console.log('Выбранная в фильтре категория не найдена:', filters.categoryId);
            matchesCategoryFilter = false;
          } else {
            // Находим категорию транзакции по ID или по полю category
            const transactionCategoryId = transaction.categoryId || transaction.category;
            
            if (!transactionCategoryId) {
              // У транзакции нет категории
              matchesCategoryFilter = false;
            } else {
              // Поиск категории транзакции в списке категорий
              const transactionCategory = getCategoryById(transactionCategoryId, categories);
              
              // Сравниваем ID категорий
              matchesCategoryFilter = transactionCategory ? 
                String(transactionCategory.id) === String(selectedCategory.id) : false;
            }
          }
        }
        
        // Проверка диапазона дат
        let matchesDateRangeFilter = true;
        if (filters.dateFrom || filters.dateTo) {
          const transactionDate = transaction.transactionDate 
            ? new Date(transaction.transactionDate) 
            : null;
            
          if (transactionDate) {
            if (filters.dateFrom) {
              const fromDate = new Date(filters.dateFrom);
              fromDate.setHours(0, 0, 0, 0);
              if (transactionDate < fromDate) {
                matchesDateRangeFilter = false;
              }
            }
            
            if (filters.dateTo) {
              const toDate = new Date(filters.dateTo);
              toDate.setHours(23, 59, 59, 999);
              if (transactionDate > toDate) {
                matchesDateRangeFilter = false;
              }
            }
          } else if (filters.dateFrom || filters.dateTo) {
            // Если у транзакции нет даты, а фильтр по дате активен
            matchesDateRangeFilter = false;
          }
        }
        
        // Проверка диапазона сумм
        let matchesAmountRangeFilter = true;
        const amount = transaction.amount || 0;
        
        if (filters.amountMin !== undefined && amount < filters.amountMin) {
          matchesAmountRangeFilter = false;
        }
        
        if (filters.amountMax !== undefined && amount > filters.amountMax) {
          matchesAmountRangeFilter = false;
        }
        
        // Результат фильтрации - должны выполняться все условия
        return matchesSearchTerm && 
               matchesTypeFilter && 
               matchesCategoryFilter && 
               matchesDateRangeFilter && 
               matchesAmountRangeFilter;
      })
    : [];
  
  // Apply pagination
  const paginatedTransactions = filteredTransactions
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Обработчик для просмотра деталей транзакции
  const handleViewTransactionDetails = (name: string) => {
    setSelectedTransactionId(name);
    setDetailsModalOpen(true);
  };
  
  // Закрытие модального окна деталей
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
  };
  
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
                console.log('Применение фильтров:', filters);
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
                    // Попытка получить категорию по ID
                    let category = getCategoryById(transaction?.categoryId, categories);
                    
                    // Если категорию не нашли по categoryId, пробуем поискать по полю category
                    if (!category && transaction.category) {
                      category = getCategoryById(transaction.category, categories);
                    }
                    
                    // Для отладки
                    console.log(
                      `Транзакция ${transaction.id}: categoryId=${transaction.categoryId}, ` +
                      `category=${transaction.category}, найденная категория:`, 
                      category
                    );
                    
                    return (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        category={category}
                        navigate={navigate}
                        handleDeleteTransaction={handleDeleteTransaction}
                        onViewDetails={handleViewTransactionDetails}
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
      
      {/* Модальное окно с деталями транзакции */}
      {selectedTransactionId !== null && (
        <TransactionDetailsModal
          open={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          transactionId={selectedTransactionId}
        />
      )}
    </Box>
  );
};

export default React.memo(TransactionsList);
