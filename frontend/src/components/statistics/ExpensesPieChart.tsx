import React from 'react';
import { Box, Typography, CircularProgress, Theme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategoryStatistics } from '../../services/statisticsService';

interface ExpensesPieChartProps {
  data: CategoryStatistics[];
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

const COLORS = ['#FF5252', '#FF4081', '#7C4DFF', '#536DFE', '#448AFF', '#64B5F6', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581'];

const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ data, loading, theme }) => {
  // Sort data by amount in descending order
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);
  
  // Take top 5 categories, combine the rest as "Other"
  let chartData: CategoryStatistics[] = [];
  
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
        categoryName: 'Other',
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
              Amount:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatCurrency(data.amount)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Percentage:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {data.percentage.toFixed(1)}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Transactions:
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
  
  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        fontSize: '12px',
        mt: 2
      }}>
        {payload.map((entry: any, index: number) => (
          <Box 
            key={`legend-${index}`} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 0.5,
              '&:last-child': { mb: 0 }
            }}
          >
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: entry.color,
                mr: 1
              }} 
            />
            <Typography variant="caption" sx={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.value} ({formatCurrency(chartData[index].amount)})
            </Typography>
          </Box>
        ))}
      </Box>
    );
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
          No expense data available
        </Typography>
      </Box>
    );
  }
  
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
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensesPieChart;
