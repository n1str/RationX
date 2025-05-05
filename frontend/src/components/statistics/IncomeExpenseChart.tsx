import React from 'react';
import { Box, Typography, CircularProgress, Theme } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PeriodStatistics } from '../../services/statisticsService';

interface IncomeExpenseChartProps {
  data: PeriodStatistics[];
  loading: boolean;
  theme: Theme;
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

// Format month name
const formatMonth = (period: string): string => {
  if (!period) return '';
  
  try {
    // If period is a full date
    if (period.includes('-')) {
      const date = new Date(period);
      return date.toLocaleDateString('ru-RU', { month: 'short' });
    }
    
    // If period is already a month name
    return period;
  } catch (error) {
    return period;
  }
};

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data, loading, theme }) => {
  // Transform data for visualization if needed
  const chartData = data.map(item => ({
    period: formatMonth(item.period),
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
                  Balance:
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No data available for selected period
        </Typography>
      </Box>
    );
  }
  
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
        <ReferenceLine y={0} stroke={theme.palette.divider} />
        <Bar 
          name="Income" 
          dataKey="income" 
          fill={theme.palette.success.main} 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          name="Expenses" 
          dataKey="expenses" 
          fill={theme.palette.error.main} 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;
