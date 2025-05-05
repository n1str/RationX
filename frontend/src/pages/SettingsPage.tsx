import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormGroup, 
  FormControlLabel, 
  Divider, 
  Container,
  Stack,
  Alert
} from '@mui/material';
import { useCustomTheme } from '../utils/theme';

const SettingsPage: React.FC = () => {
  const { mode, toggleTheme } = useCustomTheme();
  
  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Настройки
        </Typography>
        
        <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Внешний вид
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <FormGroup>
            <FormControlLabel 
              control={
                <Switch 
                  checked={mode === 'dark'} 
                  onChange={toggleTheme}
                  color="primary"
                />
              } 
              label="Темная тема" 
            />
          </FormGroup>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Переключение между светлой и темной темой интерфейса
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Дополнительные настройки
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Stack spacing={2}>
            <Alert severity="info">
              В данной версии приложения дополнительные настройки недоступны. 
              В будущих обновлениях появятся настройки валюты, формата дат и другие опции.
            </Alert>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
};

export default SettingsPage; 
