// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import store from './store';
import CustomThemeProvider from './utils/theme';
import React from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import TransactionFormPage from './pages/TransactionFormPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryFormPage from './pages/CategoryFormPage';
import StatisticsPage from './pages/StatisticsPage';

// Components
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Мемоизируем основной компонент приложения для предотвращения лишних перерисовок
const App = React.memo(() => {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={ru}
        >
          <CssBaseline />
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Transactions Routes - без дополнительных оберток */}
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/transactions/new" element={<TransactionFormPage />} />
                  <Route path="/transactions/:id" element={<TransactionFormPage />} />
                  <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />

                  {/* Categories Routes */}
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/new" element={<CategoryFormPage />} />
                  <Route path="/categories/:id/edit" element={<CategoryFormPage />} />

                  {/* Statistics Route */}
                  <Route path="/statistics" element={<StatisticsPage />} />
                </Route>
              </Route>

              {/* Redirect to login by default */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </CustomThemeProvider>
    </Provider>
  );
});

export default App;
