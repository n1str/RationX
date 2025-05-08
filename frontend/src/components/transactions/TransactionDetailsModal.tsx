// @ts-ignore
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchTransactionById, clearSelectedTransaction } from '../../store/slices/transactionsSlice';
import useDirectApi from '../../hooks/useDirectApi';

interface TransactionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: number;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ 
  open, 
  onClose, 
  transactionId 
}) => {
  const dispatch = useAppDispatch();
  
  const { selectedTransaction, loading: reduxLoading, error: reduxError } = useAppSelector((state: any) => state.transactions);
  
  // Используем прямой API для получения данных
  const { 
    data: apiTransaction, 
    loading: apiLoading, 
    error: apiError, 
    fetchTransactionById: fetchDirect,
  } = useDirectApi();
  
  // Используем данные либо из API, либо из Redux
  const transaction = apiTransaction || selectedTransaction;
  
  // Загружаем данные транзакции при открытии модального окна
  useEffect(() => {
    if (open && transactionId) {
      // Загрузка через Redux
      dispatch(fetchTransactionById(transactionId));
      // Загрузка через прямой API
      fetchDirect(transactionId);
    }
    
    return () => {
      dispatch(clearSelectedTransaction());
    };
  }, [dispatch, open, transactionId, fetchDirect]);
  
  // Статусы загрузки и ошибок
  const loading = reduxLoading || apiLoading;
  const error = apiError || reduxError;

  // Получение типа лица в читаемом виде
  const getPersonTypeLabel = (personType: string | undefined): string => {
    if (!personType) return 'Не указан';
    return personType === 'PERSON_TYPE' ? 'Физическое лицо' : 'Юридическое лицо';
  };

  // Получаем строковые представления для статуса
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'NEW': 'Новая',
      'ACCEPTED': 'Подтверждена',
      'PROCESSING': 'В обработке',
      'CANCELED': 'Отменена',
      'PAYMENT_COMPLETED': 'Платеж выполнен',
      'PAYMENT_DELETED': 'Платеж удален',
      'RETURN': 'Возврат'
    };
    return statusMap[status] || status;
  };
  
  // Получаем строковые представления для типа операции
  const getOperationTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'DEBIT': 'Дебет (Получение)',
      'CREDIT': 'Кредит (Списание)'
    };
    return typeMap[type] || type;
  };
  
  // Получаем цвет статуса
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'NEW': 'primary',
      'ACCEPTED': 'info',
      'PROCESSING': 'warning',
      'CANCELED': 'error',
      'PAYMENT_COMPLETED': 'success',
      'PAYMENT_DELETED': 'error',
      'RETURN': 'secondary'
    };
    return colorMap[status] || 'default';
  };
  
  // Форматирование суммы
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Загрузка данных транзакции...
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Ошибка загрузки
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!transaction) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Данные не найдены
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography>Транзакция не найдена или данные недоступны</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">
          Детали транзакции #{transaction.id}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 2 }}>
        {/* Основная информация о транзакции */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Основная информация</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Статус</Typography>
                  <Chip 
                    label={getStatusText(transaction.status)} 
                    color={getStatusColor(transaction.status) as any} 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Сумма</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(transaction.sum)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Категория</Typography>
                  <Typography variant="body1">{transaction.category || 'Не указана'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Тип транзакции</Typography>
                  <Typography variant="body1">{getOperationTypeText(transaction.transactionType)}</Typography>
                </Grid>
              
                {transaction.comment && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Комментарий</Typography>
                    <Typography variant="body1">{transaction.comment}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
          
          {/* Банк отправителя */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Банк отправителя</Typography>
              <Box mt={1}>
                <Typography variant="subtitle2" color="text.secondary">Название банка</Typography>
                <Typography variant="body1">{transaction.nameBankSender || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Расчетный счет</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{transaction.billSender || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Корр. счет</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{transaction.rbillSender || 'Не указано'}</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Банк получателя */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Банк получателя</Typography>
              <Box mt={1}>
                <Typography variant="subtitle2" color="text.secondary">Название банка</Typography>
                <Typography variant="body1">{transaction.nameBankRecipient || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Расчетный счет</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{transaction.billRecipient || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Корр. счет</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>{transaction.rbillRecipient || 'Не указано'}</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Отправитель */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Отправитель</Typography>
              <Box mt={1}>
                <Typography variant="subtitle2" color="text.secondary">Тип лица</Typography>
                <Typography variant="body1">{getPersonTypeLabel(transaction.personType)}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Имя/Название</Typography>
                <Typography variant="body1">{transaction.name || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">ИНН</Typography>
                <Typography variant="body1">{transaction.inn || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Адрес</Typography>
                <Typography variant="body1">{transaction.address || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Телефон</Typography>
                <Typography variant="body1">{transaction.phone || 'Не указано'}</Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Получатель */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Получатель</Typography>
              <Box mt={1}>
                <Typography variant="subtitle2" color="text.secondary">Тип лица</Typography>
                <Typography variant="body1">{getPersonTypeLabel(transaction.personTypeRecipient)}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Имя/Название</Typography>
                <Typography variant="body1">{transaction.nameRecipient || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">ИНН</Typography>
                <Typography variant="body1">{transaction.innRecipient || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Адрес</Typography>
                <Typography variant="body1">{transaction.addressRecipient || 'Не указано'}</Typography>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">Телефон</Typography>
                <Typography variant="body1">{transaction.phoneRecipient || 'Не указано'}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal; 