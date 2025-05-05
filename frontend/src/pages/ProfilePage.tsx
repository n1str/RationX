import React from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar, Stack, Container, Divider } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAppSelector } from '../hooks/reduxHooks';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Мой профиль
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              sx={{ width: 100, height: 100, bgcolor: 'primary.main', mb: 2 }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h5" fontWeight={600}>
              {user?.username || 'Пользователь'}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Персональная информация
          </Typography>

          <Stack spacing={3} mt={2}>
            <TextField
              label="Имя пользователя"
              value={user?.username || ''}
              fullWidth
              disabled
            />
            <TextField
              label="Email"
              value={user?.email || 'Не указан'}
              fullWidth
              disabled
            />
          </Stack>

          <Box mt={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Функции профиля:
            </Typography>
            <Typography color="text.secondary" paragraph>
              В данной версии приложения возможности редактирования профиля ограничены. 
              В будущих обновлениях будут добавлены дополнительные настройки.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage; 
