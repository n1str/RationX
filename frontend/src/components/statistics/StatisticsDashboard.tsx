import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchGeneralStatistics,
  fetchStatisticsByCategory,
  fetchStatisticsByPeriod,
  fetchLastMonthStatistics,
  fetchLastYearStatistics,
} from '../../store/slices/statisticsSlice';
import { CategoryStatistics, PeriodStatistics } from '../../services/statisticsService';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';

// Format number as currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const StatisticsDashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { 
    general, 
    byCategory, 
    byPeriod,
    lastMonth,
    lastYear,
    loading, 
    error 
  } = useAppSelector(state => state.statistics);
  
  const [periodType, setPeriodType] = useState('month');
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  useEffect(() => {
    dispatch(fetchGeneralStatistics());
    dispatch(fetchStatisticsByCategory());
    dispatch(fetchLastMonthStatistics());
    dispatch(fetchLastYearStatistics());
    
    if (startDate && endDate) {
      dispatch(fetchStatisticsByPeriod({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }));
    }
  }, [dispatch, startDate, endDate]);
  
  const handlePeriodChange = (event: any) => {
    const value = event.target.value;
    setPeriodType(value);
    
    const now = new Date();
    let start = new Date();
    
    switch (value) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start = new Date(now);
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
    }
    
    setStartDate(start);
    setEndDate(now);
  };
  
  // Summary cards data
  const summaryCards = [
    {
      title: 'Общий баланс',
      value: general ? formatCurrency(general.balance) : '₽0',
      color: theme.palette.success.main,
      bgColor: theme.palette.success.main + '15',
    },
    {
      title: 'Общий доход',
      value: general ? formatCurrency(general.totalIncome) : '₽0',
      color: theme.palette.success.main,
      bgColor: theme.palette.success.main + '15',
    },
    {
      title: 'Общие расходы',
      value: general ? formatCurrency(general.totalExpenses) : '₽0',
      color: theme.palette.error.main,
      bgColor: theme.palette.error.main + '15',
    },
    {
      title: 'Всего транзакций',
      value: general ? general.transactionCount : 0,
      color: theme.palette.info.main,
      bgColor: theme.palette.info.main + '15',
    },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Expenses Pie Chart Component
  const renderExpensesPieChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!byCategory || !Array.isArray(byCategory) || byCategory.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </Box>
      );
    }
    
    // Sort data by amount in descending order
    const data = byCategory.filter(cat => cat.categoryType === 'DEBIT');
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);
    
    // Take top 5 categories, combine the rest as "Other"
    let chartData = [];
    
    if (sortedData.length <= 5) {
      chartData = sortedData;
    } else {
      const top5 = sortedData.slice(0, 5);
      const otherAmount = sortedData.slice(5).reduce((sum, item) => sum + item.amount, 0);
      const otherCount = sortedData.slice(5).reduce((sum, item) => sum + item.transactionCount, 0);
      
      chartData = [
        ...top5,
        {
          categoryId: 0,
          categoryName: 'Другие',
          categoryType: 'DEBIT' as const,
          amount: otherAmount,
          percentage: 0, // Will be calculated later if needed
          transactionCount: otherCount,
        }
      ];
    }
    
    // Calculate total if needed for percentages
    const total = chartData.reduce((sum, item) => sum + item.amount, 0);
    
    // Add percentage if not already present
    chartData = chartData.map(item => ({
      ...item,
      percentage: item.percentage || (total > 0 ? (item.amount / total) * 100 : 0)
    }));
    
    const COLORS = ['#FF5252', '#FF4081', '#7C4DFF', '#536DFE', '#448AFF', '#64B5F6'];
    
    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 1.5, 
            boxShadow: theme.shadows[3], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 200
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {data.categoryName}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Сумма:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatCurrency(data.amount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Процент:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {data.percentage.toFixed(1)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Транзакций:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {data.transactionCount}
              </Typography>
            </Box>
          </Box>
        );
      }
      return null;
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="amount"
            nameKey="categoryName"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  
  // Income vs Expense Chart Component
  const renderIncomeExpenseChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!lastYear || !Array.isArray(lastYear) || lastYear.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </Box>
      );
    }
    
    // Transform data for visualization if needed
    const chartData = lastYear.map(item => ({
      period: item.period ? new Date(item.period).toLocaleDateString('ru-RU', { month: 'short' }) : '',
      income: item.income,
      expenses: item.expenses,
      balance: item.balance,
    }));
    
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 1.5, 
            boxShadow: theme.shadows[3], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {label}
            </Typography>
            {payload.map((entry: any, index: number) => (
              <Box 
                key={`tooltip-${index}`} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                  '&:last-child': { mb: 0 }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: entry.color,
                      mr: 1
                    }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    {entry.name}:
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                  {formatCurrency(entry.value)}
                </Typography>
              </Box>
            ))}
            {payload.length >= 2 && (
              <>
                <Box sx={{ my: 0.5 }}>
                  <Typography variant="caption" component="div" sx={{ borderTop: `1px dashed ${theme.palette.divider}`, my: 0.5 }}></Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Баланс:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      ml: 2,
                      color: payload[0].payload.balance >= 0 ? theme.palette.success.main : theme.palette.error.main
                    }}
                  >
                    {formatCurrency(payload[0].payload.balance)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        );
      }
      return null;
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barGap={0}
          barCategoryGap="15%"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={theme.palette.divider}
          />
          <XAxis 
            dataKey="period" 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `₽${Math.abs(value) >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>{value}</span>}
          />
          <Bar 
            name="Доход" 
            dataKey="income" 
            fill={theme.palette.success.main} 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            name="Расходы" 
            dataKey="expenses" 
            fill={theme.palette.error.main} 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  // Transactions Trend Chart Component
  const renderTransactionsTrendChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!byPeriod || !Array.isArray(byPeriod) || byPeriod.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для отображения
          </Typography>
        </Box>
      );
    }
    
    // Transform data for visualization
    const chartData = byPeriod.map(item => ({
      period: item.period ? new Date(item.period).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '',
      count: item.transactionCount,
      income: item.income,
      expenses: item.expenses,
    }));
    
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 1.5, 
            boxShadow: theme.shadows[3], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {label}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: theme.palette.primary.main,
                    mr: 1
                  }} 
                />
                <Typography variant="body2" color="text.secondary">
                  Транзакций:
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
                {payload[0].payload.count}
              </Typography>
            </Box>
          </Box>
        );
      }
      return null;
    };
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={theme.palette.divider}
          />
          <XAxis 
            dataKey="period" 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => value}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => <span style={{ color: theme.palette.text.primary, fontSize: 12 }}>{value}</span>}
          />
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Area 
            name="Транзакций" 
            type="monotone" 
            dataKey="count" 
            stroke={theme.palette.primary.main}
            fillOpacity={1}
            fill="url(#colorCount)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  
  if (loading && !general) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Финансовая статистика
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Детальный анализ ваших доходов и расходов
      </Typography>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Period selector */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Box sx={{ width: { xs: '100%', md: '33%' }, mb: { xs: 2, md: 0 } }}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="period-label">Период</InputLabel>
                <Select
                  labelId="period-label"
                  id="period-select"
                  value={periodType}
                  onChange={handlePeriodChange}
                  label="Период"
                >
                  <MenuItem value="week">За неделю</MenuItem>
                  <MenuItem value="month">За месяц</MenuItem>
                  <MenuItem value="quarter">За квартал</MenuItem>
                  <MenuItem value="year">За год</MenuItem>
                  <MenuItem value="custom">Пользовательский диапазон</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {periodType === 'custom' && (
              <>
                <Box sx={{ width: { xs: '100%', sm: '50%', md: '33%' }, mb: { xs: 2, md: 0 } }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <DatePicker
                      label="Дата начала"
                      value={startDate}
                      onChange={(date) => setStartDate(date)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%', md: '33%' } }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <DatePicker
                      label="Дата окончания"
                      value={endDate}
                      onChange={(date) => setEndDate(date)}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
        
        {/* Summary Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }} key={index}>
              <motion.div variants={itemVariants}>
                <Card sx={{ 
                  borderRadius: 3, 
                  height: '100%',
                  background: `linear-gradient(135deg, ${card.bgColor} 0%, rgba(18,18,18,0) 60%)` 
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: card.color }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          ))}
        </Box>
        
        {/* Charts Row 1 */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          {/* Income vs Expenses */}
          <Box sx={{ width: { xs: '100%', md: 'calc(66.666% - 12px)' } }}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Тренд доходов и расходов
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Месячное сравнение доходов и расходов
                </Typography>
                <Box sx={{ height: 350 }}>
                  {renderIncomeExpenseChart()}
                </Box>
              </Paper>
            </motion.div>
          </Box>
          
          {/* Expense Categories */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 12px)' } }}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Расходы по категориям
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Распределение расходов по категориям
                </Typography>
                <Box sx={{ height: 350 }}>
                  {renderExpensesPieChart()}
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Box>
        
        {/* Charts Row 2 */}
        <Box>
          {/* Transactions Trend */}
          <Box sx={{ width: '100%' }}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Тренд транзакций
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Количество транзакций за время
                </Typography>
                <Box sx={{ height: 350 }}>
                  {renderTransactionsTrendChart()}
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default StatisticsDashboard;
