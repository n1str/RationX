import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { RefreshRounded, BugReportRounded } from '@mui/icons-material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Компонент для отлавливания и обработки ошибок рендеринга в приложении
 * Предотвращает критические сбои и полностью белый экран
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Обновляем состояние, чтобы следующий рендер показал запасной UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Можно логировать ошибку в сервис аналитики
    console.error('Отловлена ошибка:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    // Сбрасываем состояние приложения
    try {
      localStorage.clear();
      this.handleReload();
    } catch (error) {
      console.error('Ошибка при сбросе приложения:', error);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Если есть кастомный fallback, используем его
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Иначе используем стандартный компонент ошибки
      return (
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Paper 
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <BugReportRounded color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              Что-то пошло не так
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              В приложении произошла ошибка. Пожалуйста, попробуйте обновить страницу 
              или сбросить данные приложения.
            </Typography>
            
            {this.state.error && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: 'background.paper',
                  overflow: 'auto',
                  textAlign: 'left'
                }}
              >
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Ошибка: {this.state.error.toString()}
                </Typography>
                
                {this.state.errorInfo && (
                  <Box component="pre" sx={{ fontSize: 12, mt: 1 }}>
                    {this.state.errorInfo.componentStack}
                  </Box>
                )}
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshRounded />} 
                onClick={this.handleReload}
              >
                Обновить страницу
              </Button>
              
              <Button 
                variant="outlined" 
                color="error" 
                onClick={this.handleReset}
              >
                Сбросить данные
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
