import React from 'react';
import { Box, Typography, CircularProgress, Theme } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area,
  AreaChart
} from 'recharts';
import { PeriodStatistics } from '../../services/statisticsService';

interface TransactionsTrendChartProps {
  data: PeriodStatistics[];
  loading: boolean;
  theme: Theme;
}

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // If period is a full date
    if (dateString.includes('-')) {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
    
    // If period is already a month name or other format
    return dateString;
  } catch (error) {
    return dateString;
  }
};

const TransactionsTrendChart: React.FC<TransactionsTrendChartProps> = ({ data, loading, theme }) => {
  // Transform data for visualization
  const chartData = data.map(item => ({
    period: formatDate(item.period),
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
                Transactions:
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
              {payload[0].payload.count}
            </Typography>
          </Box>
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
                  bgcolor: theme.palette.success.main,
                  mr: 1
                }} 
              />
              <Typography variant="body2" color="text.secondary">
                Income:
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
              }).format(payload[0].payload.income)}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%', 
                  bgcolor: theme.palette.error.main,
                  mr: 1
                }} 
              />
              <Typography variant="body2" color="text.secondary">
                Expenses:
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 2 }}>
              {new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
              }).format(payload[0].payload.expenses)}
            </Typography>
          </Box>
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
          No transaction data available for selected period
        </Typography>
      </Box>
    );
  }
  
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
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) => value}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={false}
          label={{ 
            value: 'Transactions', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: theme.palette.text.secondary, fontSize: 12 },
            dy: 50
          }}
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
          name="Transactions" 
          type="monotone" 
          dataKey="count" 
          yAxisId="left"
          stroke={theme.palette.primary.main}
          fillOpacity={1}
          fill="url(#colorCount)"
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TransactionsTrendChart;
