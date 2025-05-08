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
  Button,
  IconButton,
  Tooltip,
  Menu,
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
import transactionService, { Transaction } from '../../services/transactionService';
import useDirectApi from '../../hooks/useDirectApi';
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
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// Импортируем библиотеки jsPDF и jspdf-autotable
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Импортируем библиотеку pdfmake для лучшей поддержки кириллицы
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
// Импортируем библиотеку print-js для создания PDF через браузер
import printJS from 'print-js';

// Обновляем определение типов
declare global {
  interface Window {
    html2pdf: any;
  }
}

// Base64-encoded Arial font for Cyrillic support
const arialBase64 = 'JVBER...' // Base64 string shortened for readability, the actual code will have the full string

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
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [detailedTransactions, setDetailedTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  
  // Используем хук для прямого доступа к API
  const { 
    fetchTransactionById, 
    fetchAllTransactions 
  } = useDirectApi();
  
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
      
      // Получаем транзакции для выбранного периода
      fetchTransactionsForPeriod(startDate, endDate);
    }
  }, [dispatch, startDate, endDate]);
  
  // Удаляем динамическую загрузку библиотек jsPDF, поскольку теперь используем NPM-пакеты
  
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
          <RechartsTooltip content={<CustomTooltip />} />
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
          <RechartsTooltip content={<CustomTooltip />} />
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
          <RechartsTooltip content={<CustomTooltip />} />
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
  
  // Получение детальной информации о транзакциях напрямую из API
  const fetchDetailedTransactionsData = async (transactionIds: number[]) => {
    setLoadingTransactions(true);
    
    const detailed: any[] = [];
    
    try {
      console.log(`Загрузка подробных данных для ${transactionIds.length} транзакций...`);
      
      // Последовательно получаем данные для каждой транзакции
      for (const id of transactionIds) {
        try {
          const transactionData = await fetchTransactionById(id);
          if (transactionData) {
            detailed.push(transactionData);
          }
        } catch (err) {
          console.error(`Ошибка при загрузке транзакции ${id}:`, err);
        }
      }
      
      console.log(`Загружены данные для ${detailed.length} из ${transactionIds.length} транзакций`);
      setDetailedTransactions(detailed);
    } catch (error) {
      console.error('Ошибка при загрузке детальных данных о транзакциях:', error);
      setTransactionsError('Не удалось загрузить полные данные о транзакциях');
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  // Функция для загрузки транзакций за выбранный период
  const fetchTransactionsForPeriod = async (start: Date, end: Date) => {
    setLoadingTransactions(true);
    setTransactionsError(null);
    
    try {
      // Форматируем даты для API
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      
      console.log(`Загрузка транзакций за период: ${startDateStr} - ${endDateStr}`);
      const transactionsData = await transactionService.getTransactionsByDateRange(startDateStr, endDateStr);
      console.log(`Получено ${transactionsData.length} транзакций`);
      
      setTransactions(transactionsData);
      
      // Загружаем детальную информацию для каждой транзакции
      if (transactionsData.length > 0) {
        const ids = transactionsData.map(tx => tx.id).filter(id => id !== undefined) as number[];
        await fetchDetailedTransactionsData(ids);
      }
    } catch (error) {
      console.error('Ошибка при загрузке транзакций:', error);
      setTransactionsError('Не удалось загрузить данные о транзакциях');
      
      // Пробуем получить список всех транзакций и отфильтровать по датам
      try {
        console.log('Пробуем альтернативный способ получения транзакций...');
        const allTransactions = await fetchAllTransactions();
        
        if (Array.isArray(allTransactions)) {
          // Фильтруем транзакции по датам
          const filteredTransactions = allTransactions.filter(tx => {
            if (!tx.transactionDate) return false;
            
            const txDate = new Date(tx.transactionDate);
            return txDate >= start && txDate <= end;
          });
          
          console.log(`Получено ${filteredTransactions.length} транзакций альтернативным способом`);
          setTransactions(filteredTransactions);
          setDetailedTransactions(filteredTransactions);
        }
      } catch (backupError) {
        console.error('Ошибка при альтернативном получении транзакций:', backupError);
      }
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  // Функция для форматирования даты транзакции
  const formatTransactionDate = (dateStr?: string) => {
    if (!dateStr) return 'Н/Д';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };
  
  // Функция для получения детальной информации о транзакции
  const getDetailedTransaction = (id?: number) => {
    if (!id) return null;
    
    // Ищем детальную информацию о транзакции
    const detailed = detailedTransactions.find(tx => tx.id === id);
    
    // Если нашли детальную информацию, возвращаем ее
    if (detailed) return detailed;
    
    // Иначе ищем в обычном списке транзакций
    return transactions.find(tx => tx.id === id) || null;
  };
  
  // Функция для получения типа операции в читаемом виде
  const getTransactionTypeText = (type?: string) => {
    if (type === 'DEBIT') return 'Доход';
    if (type === 'CREDIT') return 'Расход';
    return type || 'Н/Д';
  };
  
  // Обработчики для меню экспорта
  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportFormatSelect = (format: string) => {
    setExportFormat(format);
    
    if (format === 'pdf') {
      exportToPDF();
    } else if (format === 'csv') {
      exportToCSV();
    }
    
    handleExportClose();
  };

  // Функция для экспорта в CSV (для Excel)
  const exportToCSV = () => {
    try {
      setExportLoading(true);
      // Подготовка данных для экспорта
      const csvData = [];

      // Добавим заголовок отчета
      csvData.push(['Финансовая статистика за период', '', '']);
      csvData.push([`${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`, '', '']);
      csvData.push(['', '', '']);

      // Добавим общую информацию
      if (general) {
        csvData.push(['Общие показатели', '', '']);
        csvData.push(['Общий баланс', general.balance.toString(), 'руб.']);
        csvData.push(['Общий доход', general.totalIncome.toString(), 'руб.']);
        csvData.push(['Общие расходы', general.totalExpenses.toString(), 'руб.']);
        csvData.push(['Всего транзакций', general.transactionCount.toString(), '']);
        csvData.push(['Средняя транзакция', general.averageTransaction.toString(), 'руб.']);
        csvData.push(['Наибольший доход', general.largestIncome.toString(), 'руб.']);
        csvData.push(['Наибольший расход', general.largestExpense.toString(), 'руб.']);
        csvData.push(['', '', '']);
      }

      // Добавим информацию по категориям
      if (byCategory && byCategory.length > 0) {
        csvData.push(['Статистика по категориям', '', '']);
        csvData.push(['Название категории', 'Тип', 'Сумма', 'Процент от общего', 'Количество транзакций']);
        
        byCategory.forEach(category => {
          csvData.push([
            category.categoryName,
            category.categoryType === 'DEBIT' ? 'Доход' : 'Расход',
            category.amount.toString(),
            `${category.percentage.toFixed(2)}%`,
            category.transactionCount.toString()
          ]);
        });
        
        csvData.push(['', '', '']);
      }

      // Добавим информацию по периодам
      if (byPeriod && byPeriod.length > 0) {
        csvData.push(['Статистика по периодам', '', '']);
        csvData.push(['Период', 'Доходы', 'Расходы', 'Баланс', 'Количество транзакций']);
        
        byPeriod.forEach(period => {
          const date = new Date(period.period);
          csvData.push([
            date.toLocaleDateString(),
            period.income.toString(),
            period.expenses.toString(),
            period.balance.toString(),
            period.transactionCount.toString()
          ]);
        });
        
        csvData.push(['', '', '']);
      }
      
      // Добавим детальную информацию по транзакциям
      if (transactions && transactions.length > 0) {
        csvData.push(['Список транзакций', '', '']);
        csvData.push([
          'ID', 
          'Дата', 
          'Тип', 
          'Сумма', 
          'Категория', 
          'Комментарий',
          'Отправитель',
          'ИНН отправителя',
          'Банк отправителя',
          'Счет отправителя',
          'Корр. счет отправителя',
          'Получатель',
          'ИНН получателя',
          'Банк получателя',
          'Счет получателя',
          'Корр. счет получателя'
        ]);
        
        transactions.forEach(tx => {
          // Получаем детальную информацию о транзакции
          const detailedTx = getDetailedTransaction(tx.id);
          
          // Если есть детальная информация, используем ее, иначе используем базовую
          const data = detailedTx || tx;
          
          csvData.push([
            data.id?.toString() || '',
            formatTransactionDate(data.transactionDate),
            getTransactionTypeText(data.transactionType),
            data.sum.toString(),
            data.category || '',
            data.comment || '',
            data.name || '',
            data.inn || '',
            // Используем разные поля в зависимости от структуры объекта
            data.nameBankSender || data.nameBank || '',
            data.billSender || data.bill || '',
            data.rBillSender || data.rBill || '',
            data.nameRecipient || '',
            data.innRecipient || '',
            data.nameBankRecipient || data.nameBankRecip || '',
            data.billRecipient || data.billRecip || '',
            data.rBillRecipient || data.rBillRecip || ''
          ]);
        });
      }

      // Преобразование в CSV формат
      let csvContent = csvData.map(row => row.join(';')).join('\n');
      
      // Создание и скачивание файла
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Текущая дата для имени файла
      const date = new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', `finance-report-${formattedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Экспорт в CSV успешно выполнен');
      setExportLoading(false);
    } catch (error) {
      console.error('Ошибка при экспорте в CSV:', error);
      alert('Произошла ошибка при создании CSV-файла.');
      setExportLoading(false);
    }
  };

  // Функция для экспорта в PDF с использованием серверной генерации
  const exportToPDF = () => {
    try {
      setExportLoading(true);
      
      if (!startDate || !endDate) {
        alert('Пожалуйста, выберите период для отчета');
        setExportLoading(false);
        return;
      }
      
      // Импортируем базовый URL из настроек API
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const BASE_URL = isLocalhost ? 'http://localhost:8080' : `http://${hostname}:8080`;
      
      // Формируем URL для запроса к бэкенду
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();
      
      // Формируем полный URL с базовым URL и путем API
      const apiPath = `/api/statistics/export-pdf?start=${encodeURIComponent(startDateIso)}&end=${encodeURIComponent(endDateIso)}`;
      const fullApiUrl = `${BASE_URL}${apiPath}`;
      console.log('Запрос PDF отчета, полный URL:', fullApiUrl);
      
      console.log('Запрос PDF с параметрами:', { startDate: startDateIso, endDate: endDateIso });
      
      // Получаем JWT-токен из localStorage
      const token = localStorage.getItem('token');
      
      // Используем fetch с полным URL для скачивания файла
      fetch(fullApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf, application/json',
          // Добавляем JWT-токен в заголовок Authorization
          ...token ? { 'Authorization': `Bearer ${token}` } : {}
        },
        // Убираем передачу куки для решения проблемы CORS
        credentials: 'omit'
      })
      .then(async response => {
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          // Пытаемся получить детальное сообщение об ошибке
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          }
          throw new Error(errorMessage);
        }
        return response.blob();
      })
      .then(blob => {
        // Проверка, что полученный блоб действительно PDF
        if (blob.type !== 'application/pdf') {
          throw new Error(`Неверный тип файла: ${blob.type}, ожидался application/pdf`);
        }
        
        // Создаем ссылку на полученный PDF-файл
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Формируем имя файла с текущей датой
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
        link.href = url;
        link.download = `finance-report-${formattedDate}.pdf`;
        
        // Добавляем ссылку в DOM и активируем скачивание
        document.body.appendChild(link);
        link.click();
        
        // Очищаем ресурсы
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setExportLoading(false);
        }, 100);
        
        console.log('PDF успешно скачан');
      })
      .catch(error => {
        console.error('Ошибка при скачивании PDF:', error);
        alert(`Произошла ошибка при создании PDF файла: ${error.message}`);
        setExportLoading(false);
      });
    } catch (error) {
      console.error('Ошибка при экспорте в PDF:', error);
      alert(`Произошла ошибка при создании PDF файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      setExportLoading(false);
    }
  };
  
  if (loading && !general) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Финансовая статистика
        </Typography>
        
        <Box>
          {exportLoading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudDownloadIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleExportClick}
                aria-haspopup="true"
                aria-controls="export-menu"
                sx={{ mr: 1 }}
              >
                Экспорт
              </Button>
              <Menu
                id="export-menu"
                anchorEl={exportAnchorEl}
                keepMounted
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
              >
                <MenuItem onClick={() => handleExportFormatSelect('pdf')}>
                  <PictureAsPdfIcon fontSize="small" sx={{ mr: 1 }} />
                  PDF (с инструкцией)
                </MenuItem>
                <MenuItem onClick={() => handleExportFormatSelect('csv')}>
                  <TableChartIcon fontSize="small" sx={{ mr: 1 }} />
                  Excel (CSV)
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
      
      {loadingTransactions && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="body1">
              {exportLoading ? 'Создание отчёта...' : 'Загрузка подробных данных о транзакциях для отчета...'}
            </Typography>
            {!exportLoading && (
              <Typography variant="caption" color="text.secondary">
                Загружено {detailedTransactions.length} из {transactions.length} транзакций
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ошибка при загрузке статистики: {error}
        </Alert>
      )}
      
      {transactionsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {transactionsError}
        </Alert>
      )}
      
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
