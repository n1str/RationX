import React from 'react';
import { Box, Container } from '@mui/material';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionFormModal from '../components/transactions/TransactionFormModal';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const TransactionFormPage: React.FC = () => {
  // Используем модальную версию формы вместо обычной
  return <TransactionFormModal />;
};

export default TransactionFormPage;
