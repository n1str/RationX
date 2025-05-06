import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Typography, Container, Box, Button } from '@mui/material';
import { Provider } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import store from './store';
import CustomThemeProvider from './utils/theme';

// Lazy loading компонентов для улучшения производительности
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = React.lazy(() => import('./pages/TransactionsPage'));
const TransactionFormPage = React.lazy(() => import('./pages/TransactionFormPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const CategoryFormPage = React.lazy(() => import('./pages/CategoryFormPage'));
const StatisticsPage = React.lazy(() => import('./pages/StatisticsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Компоненты
const Layout = React.lazy(() => import('./components/common/Layout'));
const ProtectedRoute = React.lazy(() => import('./components/common/ProtectedRoute'));

// Компонент загрузки
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography variant="h5">Загрузка...</Typography>
  </Box>
);

// Тестовая домашняя страница для проверки работы
const HomePage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Box sx={{ textAlign: 'center', p: 4, border: '1px solid #eee', borderRadius: 2 }}>
        <Typography variant="h3" gutterBottom>
          Добро пожаловать в RationX
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Финансовое приложение для управления транзакциями
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" href="/login" sx={{ mx: 1 }}>
            Войти
          </Button>
          <Button variant="outlined" color="primary" href="/register" sx={{ mx: 1 }}>
            Регистрация
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

// Мемоизируем основной компонент приложения для предотвращения лишних перерисовок
const App = () => {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={ru}
        >
          <CssBaseline />
          <Router>
            <React.Suspense fallback={<Loading />}>
              <Routes>
                {/* Тестовая домашняя страница */}
                <Route path="/" element={<HomePage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/transactions/new" element={<TransactionFormPage />} />
                    <Route path="/transactions/:id" element={<TransactionFormPage />} />
                    <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/categories/new" element={<CategoryFormPage />} />
                    <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </React.Suspense>
          </Router>
        </LocalizationProvider>
      </CustomThemeProvider>
    </Provider>
  );
};

export default App;
