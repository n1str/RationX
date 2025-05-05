import React from 'react';
import { Container, Box } from '@mui/material';
import CategoryForm from '../components/categories/CategoryForm';

/**
 * Страница формы создания/редактирования категории
 */
const CategoryFormPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box py={3}>
        <CategoryForm />
      </Box>
    </Container>
  );
};

export default CategoryFormPage;
