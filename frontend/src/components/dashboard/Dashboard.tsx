import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Divider, 
  Button,
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
import { useCustomTheme } from '../../utils/theme';
import TransactionDetailsModal from '../transactions/TransactionDetailsModal';

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
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Не указана';
  
  try {
    const date = new Date(dateString);
    // Проверка на валидность даты
    if (isNaN(date.getTime())) {
      return 'Не указана';
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Ошибка при форматировании даты:', dateString, error);
    return 'Не указана';
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'];

// Кастомный компонент для отображения легенды
const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="pie-chart-legend" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
      {payload.map((entry: any, index: number) => (
        <motion.li 
          key={`item-${index}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 * index }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: 8,
            cursor: 'pointer',
            padding: '5px 8px',
            borderRadius: 4,
            transition: 'all 0.3s ease'
          }}
          whileHover={{ 
            backgroundColor: 'rgba(0,0,0,0.05)',
            transform: 'translateX(3px)'
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 2,
              background: entry.color,
              marginRight: 8,
              boxShadow: '1px 1px 3px rgba(0,0,0,0.15)'
            }}
          />
          <span style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>
            {entry.value || 'Без категории'}:
          </span>
          <span style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>
            {formatCurrency(entry.payload.amount || 0)}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

// Функция для получения категории по идентификатору с исправленным сравнением
const getCategoryById = (categoryId: string | number | undefined, categoriesList: any[]): any => {
  if (!categoryId || !Array.isArray(categoriesList) || categoriesList.length === 0) return null;
  
  try {
    // Приводим ID категории к строке для сравнения
    const categoryIdStr = String(categoryId);
    
    // Сначала пробуем найти по точному совпадению ID
    let foundCategory = categoriesList.find(c => String(c.id) === categoryIdStr);
    
    // Если не нашли по ID, пробуем поискать по полю name (если categoryId - это название)
    if (!foundCategory && typeof categoryId === 'string') {
      foundCategory = categoriesList.find(c => c.name === categoryId);
    }
    
    // Если не нашли никак, пытаемся найти категорию с тем же ID но в другом типе данных
    if (!foundCategory) {
      const categoryIdNum = parseInt(categoryIdStr);
      if (!isNaN(categoryIdNum)) {
        foundCategory = categoriesList.find(c => c.id === categoryIdNum);
      }
    }
    
    return foundCategory;
  } catch (error) {
    console.error('Ошибка при поиске категории:', error);
    return null;
  }
};

const Dashboard: React.FC = () => {
  const { mode } = useCustomTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { general, lastMonth, loading: statsLoading } = useAppSelector(state => state.statistics);
  const { items: transactions = [], loading: transactionsLoading } = useAppSelector(state => state.transactions);
  const { items: categories = [] } = useAppSelector(state => state.categories);
  
  useEffect(() => {
    console.log('Dashboard: загрузка данных...');
    dispatch(fetchGeneralStatistics());
    dispatch(fetchLastMonthStatistics());
    dispatch(fetchAllTransactions());
    dispatch(fetchAllCategories());
  }, [dispatch]);
  
  const loading = statsLoading || transactionsLoading;
  
  // Отладочный вывод для проверки состояния статистики
  useEffect(() => {
    try {
      console.log('Dashboard: обновлены данные статистики:', { general, lastMonth });
    } catch (error) {
      console.error('Ошибка при логировании данных статистики:', error);
    }
  }, [general, lastMonth]);
  
  // Обработка случая отсутствия данных
  useEffect(() => {
    if (!loading && !general) {
      console.log('Dashboard: данные не загружены, пробуем загрузить снова...');
      setTimeout(() => {
        dispatch(fetchGeneralStatistics());
        dispatch(fetchLastMonthStatistics());
      }, 1000);
    }
  }, [dispatch, loading, general]);
  
  // Get 5 recent transactions
  const recentTransactions = transactions && Array.isArray(transactions)
    ? [...transactions]
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5)
    : [];
  
  // Create data for bar chart
  const chartData = transactions && Array.isArray(transactions)
    ? transactions
        .filter(transaction => transaction.type === 'CREDIT')
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
      color: mode === 'dark' ? '#fff' : '#000',
      bgColor: mode === 'dark' ? '#333' : '#f0f0f0',
    },
    {
      title: 'Доход',
      value: general ? formatCurrency(general.totalIncome) : '₽0',
      icon: <TrendingUp />,
      color: mode === 'dark' ? '#fff' : '#000',
      bgColor: mode === 'dark' ? '#333' : '#f0f0f0',
    },
    {
      title: 'Расходы',
      value: general ? formatCurrency(general.totalExpenses) : '₽0',
      icon: <TrendingDown />,
      color: mode === 'dark' ? '#fff' : '#000',
      bgColor: mode === 'dark' ? '#333' : '#f0f0f0',
    },
    {
      title: 'Транзакции',
      value: general ? general.transactionCount : 0,
      icon: <Receipt />,
      color: mode === 'dark' ? '#fff' : '#000',
      bgColor: mode === 'dark' ? '#333' : '#f0f0f0',
    },
  ];

  // Подготовка данных о категориях расходов и доходов
  const creditCategories = useMemo(() => {
    if (!transactions || !categories) return [];
    
    const categoryTotals: Record<string, { id: string, name: string, amount: number, color: string }> = {};

    // Получаем только доходы (CREDIT)
    transactions
    .filter(t => t.type === 'CREDIT')
    .forEach(transaction => {
      // Применяем нашу надежную функцию для поиска категории
      let category = getCategoryById(transaction.categoryId, categories);
      
      // Если категорию не нашли по categoryId, пробуем поискать по полю category
      if (!category && transaction.category) {
        category = getCategoryById(transaction.category, categories);
      }
      
      // Убираем отладочный вывод, который мог вызывать ошибки
      
      if (!category) {
        // Если категория не найдена, добавляем в "Без категории"
        const unknownCatId = 'unknown';
        if (!categoryTotals[unknownCatId]) {
          categoryTotals[unknownCatId] = {
            id: unknownCatId,
            name: 'Без категории',
            amount: 0,
            color: COLORS[Object.keys(categoryTotals).length % COLORS.length]
          };
        }
        categoryTotals[unknownCatId].amount += Math.abs(transaction.amount || 0);
      } else {
        // Используем найденную категорию
        const categoryId = String(category.id);
        const categoryName = category.name || 'Без имени';
        
        // Если такой категории еще нет в объекте, создаем её
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            id: categoryId,
            name: categoryName,
            amount: 0,
            color: COLORS[Object.keys(categoryTotals).length % COLORS.length]
          };
        }
        
        // Добавляем сумму транзакции к общей сумме категории
        categoryTotals[categoryId].amount += Math.abs(transaction.amount || 0);
      }
    });

    // Преобразуем объект в массив и сортируем по убыванию суммы
    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // НОВЫЙ КОД: Подготовка данных о категориях расходов
  const expenseCategories = useMemo(() => {
    if (!transactions || !categories) return [];
    
    const categoryTotals: Record<string, { id: string, name: string, amount: number, color: string }> = {};

    // Получаем только расходы (DEBIT)
    transactions
    .filter(t => t.type === 'DEBIT')
    .forEach(transaction => {
      // Применяем нашу надежную функцию для поиска категории
      let category = getCategoryById(transaction.categoryId, categories);
      
      // Если категорию не нашли по categoryId, пробуем поискать по полю category
      if (!category && transaction.category) {
        category = getCategoryById(transaction.category, categories);
      }
      
      // Убираем отладочный вывод, который мог вызывать ошибки
      
      if (!category) {
        // Если категория не найдена, добавляем в "Без категории"
        const unknownCatId = 'unknown';
        if (!categoryTotals[unknownCatId]) {
          categoryTotals[unknownCatId] = {
            id: unknownCatId,
            name: 'Без категории',
            amount: 0,
            color: COLORS[Object.keys(categoryTotals).length % COLORS.length]
          };
        }
        categoryTotals[unknownCatId].amount += Math.abs(transaction.amount || 0);
      } else {
        // Используем найденную категорию
        const categoryId = String(category.id);
        const categoryName = category.name || 'Без имени';
        
        // Если такой категории еще нет в объекте, создаем её
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            id: categoryId,
            name: categoryName,
            amount: 0,
            color: COLORS[Object.keys(categoryTotals).length % COLORS.length]
          };
        }
        
        // Добавляем сумму транзакции к общей сумме категории
        categoryTotals[categoryId].amount += Math.abs(transaction.amount || 0);
      }
    });

    // Преобразуем объект в массив и сортируем по убыванию суммы
    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Новая анимация для ховера карточек
  const paperHoverStyle = {
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: mode === 'dark' 
        ? '0px 10px 30px rgba(0, 0, 0, 0.3)' 
        : '0px 10px 30px rgba(0, 0, 0, 0.1)',
    }
  };

  const chartVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -3,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  // Улучшенная функция для отображения меток на диаграмме
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    // Вообще не показываем метки, если значение слишком маленькое
    if (percent < 0.05) return null;
    
    // Расчет позиции метки
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1; // Чуть дальше от диаграммы
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#333"
        fontWeight="500"
        fontSize="13"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {formatCurrency(value)} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  // Новое состояние для модального окна просмотра деталей транзакции
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Обработчик клика по транзакции
  const handleTransactionClick = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setDetailsModalOpen(true);
  };
  
  // Закрытие модального окна деталей
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Панель управления
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Добро пожаловать! Вот краткий обзор ваших финансов
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
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
                  style={{ flex: '1 1 200px', minWidth: '200px' }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                      bgcolor: mode === 'dark' ? 'background.paper' : 'background.default',
                      border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        {card.title}
                      </Typography>
                      <Avatar
                        sx={{
                          bgcolor: card.bgColor,
                          color: card.color,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                      {card.value}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Stack>
            
            {/* Charts Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              {/* Income Overview */}
              <motion.div 
                variants={chartVariants}
                whileHover="hover"
                style={{ width: '100%', height: '100%' }}
              >
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Обзор доходов
                    </Typography>
                    <Button 
                      variant="text" 
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/statistics')}
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(3px)'
                        }
                      }}
                    >
                      Показать все
                    </Button>
                  </Box>
                  
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {creditCategories && creditCategories.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
                              </filter>
                              {COLORS.map((color, index) => (
                                <linearGradient key={index} id={`colorGradient${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0.7}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={creditCategories}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={100}
                              innerRadius={70}
                              fill="#8884d8"
                              filter="url(#shadow)"
                              dataKey="amount"
                              nameKey="name"
                              stroke="#0088FE"
                            >
                              {creditCategories.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color || COLORS[index % COLORS.length]} 
                                  stroke={entry.color || COLORS[index % COLORS.length]} 
                                  filter="url(#shadow)" 
                                  id={entry.name}
                                  color={entry.color || COLORS[index % COLORS.length]}
                                />
                              ))}
                              <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '16px', fontWeight: '600', fill: '#333' }}
                              >
                                Доходы
                              </text>
                              <text 
                                x="50%" 
                                y="50%" 
                                dy="20" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                style={{ fontSize: '14px', fontWeight: '500', fill: '#666' }}
                              >
                                {formatCurrency(creditCategories.reduce((sum, item) => sum + item.amount, 0))}
                              </text>
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%' }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                          <Receipt sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            Нет данных о доходах
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap' }}>
                    {creditCategories.slice(0, 3).map((category, index) => (
                      <Box key={index} sx={{ width: '100%', mb: 1 }}>
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '3px',
                                  bgcolor: category.color || COLORS[index % COLORS.length],
                                  mr: 1.5,
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {category.name}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(category.amount)}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </motion.div>

              {/* Expense Overview */}
              <motion.div 
                variants={chartVariants}
                whileHover="hover"
                style={{ width: '100%', height: '100%' }}
              >
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Обзор расходов
                    </Typography>
                    <Button 
                      variant="text" 
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/statistics')}
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(3px)'
                        }
                      }}
                    >
                      Показать все
                    </Button>
                  </Box>
                  
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {expenseCategories && expenseCategories.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
                              </filter>
                              {COLORS.map((color, index) => (
                                <linearGradient key={index} id={`colorGradient${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0.7}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <Pie
                              data={expenseCategories}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={100}
                              innerRadius={70}
                              fill="#8884d8"
                              filter="url(#shadow)"
                              dataKey="amount"
                              nameKey="name"
                              stroke="#FF8042"
                            >
                              {expenseCategories.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color || COLORS[index % COLORS.length]} 
                                  stroke={entry.color || COLORS[index % COLORS.length]} 
                                  filter="url(#shadow)" 
                                  id={entry.name}
                                  color={entry.color || COLORS[index % COLORS.length]}
                                />
                              ))}
                              <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: '16px', fontWeight: '600', fill: '#333' }}
                              >
                                Расходы
                              </text>
                              <text 
                                x="50%" 
                                y="50%" 
                                dy="20" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                style={{ fontSize: '14px', fontWeight: '500', fill: '#666' }}
                              >
                                {formatCurrency(expenseCategories.reduce((sum, item) => sum + item.amount, 0))}
                              </text>
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%' }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                          <Receipt sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            Нет данных о расходах
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap' }}>
                    {expenseCategories.slice(0, 3).map((category, index) => (
                      <Box key={index} sx={{ width: '100%', mb: 1 }}>
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '3px',
                                  bgcolor: category.color || COLORS[index % COLORS.length],
                                  mr: 1.5,
                                }}
                              />
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {category.name}
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(category.amount)}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Box>

            {/* Recent Transactions Section */}
            <motion.div 
              variants={chartVariants}
              whileHover="hover"
              style={{ width: '100%' }}
            >
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  transition: 'all 0.2s ease',
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Последние транзакции
                  </Typography>
                  <Button 
                    variant="text" 
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/transactions')}
                    sx={{
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        transform: 'translateX(3px)'
                      }
                    }}
                  >
                    Показать все
                  </Button>
                </Box>
                
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  {recentTransactions && recentTransactions.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {recentTransactions.map((transaction, index) => {
                        // Попытка получить категорию по ID - делаем так же, как в TransactionsList.tsx
                        let category = getCategoryById(transaction?.categoryId, categories);
                        
                        // Если категорию не нашли по categoryId, пробуем поискать по полю category
                        if (!category && transaction.category) {
                          category = getCategoryById(transaction.category, categories);
                        }
                        
                        // Для отладки
                        console.log(
                          `Дашборд: транзакция ${transaction.id}: categoryId=${transaction.categoryId}, ` +
                          `category=${transaction.category}, найденная категория:`, 
                          category
                        );
                        
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
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                  transform: 'translateX(5px)'
                                }
                              }}
                              onClick={() => handleTransactionClick(transaction.id || 0)}
                              component="div"
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: transaction.type === 'CREDIT' ? 'success.light' : 'error.light',
                                    color: 'white'
                                  }}
                                >
                                  {transaction.type === 'CREDIT' ? 
                                    <TrendingUp /> : 
                                    <TrendingDown />
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
                                      color={transaction.type === 'CREDIT' ? 'success.main' : 'error.main'}
                                    >
                                      {transaction.type === 'CREDIT' ? '+' : '-'}
                                      {formatCurrency(Math.abs(transaction.amount))}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      {category?.name || (transaction.categoryId ? `Категория №${transaction.categoryId}` : 'Без категории')}
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
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/transactions/new')}
                      fullWidth
                      sx={{
                        mt: 1.5,
                        py: 1,
                        transition: 'all 0.15s ease',
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        }
                      }}
                    >
                      Добавить транзакцию
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Box>
        </motion.div>
      )}
      
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

export default Dashboard;
