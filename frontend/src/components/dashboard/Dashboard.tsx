import React, { useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Divider, 
  Button,
  useTheme,
  CircularProgress,
  Skeleton,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AccountBalance, 
  Receipt, 
  ArrowForward,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchGeneralStatistics, fetchLastMonthStatistics } from '../../store/slices/statisticsSlice';
import { fetchAllTransactions } from '../../store/slices/transactionsSlice';
import { fetchAllCategories } from '../../store/slices/categoriesSlice';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { PieChart, Pie, Legend, Tooltip } from 'recharts';

// Format number as currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to locale string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { general, lastMonth, loading: statsLoading } = useAppSelector(state => state.statistics);
  const { items: transactions = [], loading: transactionsLoading } = useAppSelector(state => state.transactions);
  const { items: categories = [] } = useAppSelector(state => state.categories);
  
  useEffect(() => {
    dispatch(fetchGeneralStatistics());
    dispatch(fetchLastMonthStatistics());
    dispatch(fetchAllTransactions());
    dispatch(fetchAllCategories());
  }, [dispatch]);
  
  const loading = statsLoading || transactionsLoading;
  
  // Get 5 recent transactions
  const recentTransactions = transactions && Array.isArray(transactions)
    ? [...transactions]
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5)
    : [];
  
  // Create data for bar chart
  const chartData = transactions && Array.isArray(transactions)
    ? transactions
        .filter(transaction => transaction.type === 'DEBIT')
        .slice(0, 7)
        .map(transaction => {
          const category = categories && Array.isArray(categories) 
            ? categories.find(cat => cat.id === transaction.categoryId)
            : null;
          return {
            name: category?.name || 'Unknown',
            amount: transaction.amount,
          };
        })
    : [];
  
  const summaryCards = [
    {
      title: 'Общий баланс',
      value: general ? formatCurrency(general.balance) : '₽0',
      icon: <AccountBalance />,
      color: theme.palette.primary.main,
      bgColor: theme.palette.primary.light,
    },
    {
      title: 'Доход',
      value: general ? formatCurrency(general.totalIncome) : '₽0',
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      bgColor: theme.palette.success.light,
    },
    {
      title: 'Расходы',
      value: general ? formatCurrency(general.totalExpenses) : '₽0',
      icon: <TrendingDown />,
      color: theme.palette.error.main,
      bgColor: theme.palette.error.light,
    },
    {
      title: 'Транзакции',
      value: general ? general.transactionCount : 0,
      icon: <Receipt />,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.light,
    },
  ];

  const expenseCategories = transactions && Array.isArray(transactions)
    ? transactions
        .filter(transaction => transaction.type === 'DEBIT')
        .map(transaction => {
          const category = categories && Array.isArray(categories)
            ? categories.find(cat => cat.id === transaction.categoryId)
            : null;
          return {
            name: category?.name || 'Unknown',
            amount: transaction.amount,
            categoryName: category?.name || 'Unknown',
          };
        })
    : [];

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  const chartVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const renderCustomizedLabel = ({ value, percent }: any) => {
    return `${value} (${percent}%)`;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Панель управления
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Добро пожаловать! Вот краткий обзор ваших финансов
      </Typography>
      
      <motion.div
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <Box>
          {/* Summary Cards */}
          <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 4 }}>
            {summaryCards.map((card, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                style={{ flex: '1 1 200px' }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(145deg, ${card.bgColor}, ${theme.palette.background.paper})`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: card.color,
                        width: 50,
                        height: 50,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {card.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </Stack>
          
          {/* Charts Section */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            {/* Expense Overview */}
            <motion.div variants={chartVariants}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme => `0 8px 25px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.3 : 0.1})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Обзор расходов
                  </Typography>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="text" 
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/statistics')}
                    >
                      Показать все
                    </Button>
                  </motion.div>
                </Box>
                
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {expenseCategories && expenseCategories.length > 0 ? (
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                          >
                            {expenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`₽${value}`, 'Сумма']}
                            labelFormatter={(name) => `Категория: ${name}`}
                          />
                          <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            formatter={(value, entry, index) => {
                              const { payload } = entry as any;
                              return (
                                <Typography variant="body2" sx={{ color: COLORS[index % COLORS.length] }}>
                                  {payload.categoryName}
                                </Typography>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <TrendingDown sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          Нет данных о расходах
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Box>
              </Paper>
            </motion.div>
            
            {/* Recent Transactions */}
            <motion.div variants={chartVariants}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme => `0 8px 25px rgba(0,0,0,${theme.palette.mode === 'dark' ? 0.3 : 0.1})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Последние транзакции
                  </Typography>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="text" 
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/transactions')}
                    >
                      Показать все
                    </Button>
                  </motion.div>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  {recentTransactions && recentTransactions.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {recentTransactions.map((transaction, index) => {
                        const category = categories && Array.isArray(categories) 
                          ? categories.find(c => c.id === transaction.categoryId)
                          : null;
                        return (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ListItem 
                              sx={{ 
                                px: 2, 
                                py: 1.5,
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                }
                              }}
                              onClick={() => navigate(`/transactions/${transaction.id}`)}
                              component={motion.div}
                              whileHover={{ x: 5 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: transaction.type === 'DEBIT' ? 'error.light' : 'success.light',
                                    color: 'white'
                                  }}
                                >
                                  {transaction.type === 'DEBIT' ? 
                                    <TrendingDown /> : 
                                    <TrendingUp />
                                  }
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight={500}>
                                      {transaction.description}
                                    </Typography>
                                    <Typography 
                                      variant="body1" 
                                      fontWeight={600}
                                      color={transaction.type === 'DEBIT' ? 'error.main' : 'success.main'}
                                    >
                                      {transaction.type === 'DEBIT' ? '-' : '+'}
                                      {formatCurrency(transaction.amount)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {category?.name || 'Без категории'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(transaction.transactionDate)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          </motion.div>
                        );
                      })}
                    </List>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                        <Receipt sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                          Нет последних транзакций
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Box>
                
                {transactions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => navigate('/transactions/new')}
                        sx={{ 
                          borderRadius: 3, 
                          py: 1.5,
                          background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #1976D2 0%, #00B0FF 100%)',
                            boxShadow: '0 6px 20px rgba(33, 150, 243, 0.5)'
                          }
                        }}
                        startIcon={<Add />}
                      >
                        Добавить новую транзакцию
                      </Button>
                    </motion.div>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
