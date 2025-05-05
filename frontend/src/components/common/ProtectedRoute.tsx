import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';

const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Только для отладки - выводим текущее состояние авторизации
    console.log('Protected Route - Auth State:', { isLoggedIn });
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    console.log('User not authenticated, redirecting to login');
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  console.log('User authenticated, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
