import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton, 
  CircularProgress 
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Visibility, VisibilityOff, PersonOutline, LockOutlined } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { login, clearError } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });

  const dispatch = useAppDispatch();
  const { isLoggedIn, loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Для отладки - проверим текущее состояние
    console.log('Login Component State:', { isLoggedIn, loading, error });
    
    // If user is already logged in, redirect to dashboard
    if (isLoggedIn) {
      navigate('/dashboard');
    }
    
    // Clear any errors when component mounts
    dispatch(clearError());
  }, [isLoggedIn, navigate, dispatch]);

  const validateForm = (): boolean => {
    const errors = {
      username: '',
      password: '',
    };
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login({ username, password })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 2,
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="h5" textAlign="center" sx={{ mb: 2, fontWeight: 600 }}>
              Вход в систему
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Имя пользователя"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!formErrors.username}
                helperText={formErrors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Пароль"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Войти"}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Нет аккаунта?{' '}
                  <RouterLink to="/register" style={{ fontWeight: 600 }}>
                    Зарегистрируйтесь
                  </RouterLink>
                </Typography>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;
