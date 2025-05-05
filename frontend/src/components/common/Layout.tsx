import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  AccountBalance as TransactionIcon,
  BarChart as StatisticsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';

// Увеличиваем ширину меню
const drawerWidth = 250;

const Layout: React.FC = () => {
  const theme = useTheme();
  // Создаем более точные breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // до 600px
  const isTablet = useMediaQuery('(min-width:601px) and (max-width:919px)'); // от 601px до 919px
  const isDesktop = useMediaQuery('(min-width:920px)'); // от 920px и выше
  
  // Меню всегда закрыто по умолчанию, независимо от размера экрана
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    // Всегда закрываем меню при навигации, независимо от размера экрана
    setOpen(false);
  };

  const menuItems = [
    { text: 'Панель управления', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Транзакции', icon: <TransactionIcon />, path: '/transactions' },
    { text: 'Категории', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Статистика', icon: <StatisticsIcon />, path: '/statistics' },
    { text: 'Настройки', icon: <SettingsIcon />, path: '/settings' },
  ];

  const NavListItem = ({ icon, text, path, isSelected }: {
    icon: React.ReactNode;
    text: string;
    path: string;
    isSelected: boolean;
  }) => (
    <motion.div
      whileHover={{ x: 8, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ListItemButton
        onClick={() => handleNavigate(path)}
        selected={isSelected}
        sx={{ 
          borderRadius: 2, 
          py: 1.5,
          mb: 1,
          ...(isSelected && {
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, rgba(25,118,210,0.2) 0%, rgba(25,118,210,0) 100%)' 
              : 'linear-gradient(90deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0) 100%)',
            borderLeft: theme => `4px solid ${theme.palette.primary.main}`,
          })
        }}
      >
        <ListItemIcon sx={{ 
          minWidth: 40,
          color: isSelected ? 'primary.main' : 'inherit'
        }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={
            <Typography sx={{ 
              fontWeight: isSelected ? 600 : 400,
              transition: 'all 0.2s'
            }}>
              {text}
            </Typography>
          } 
        />
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%', 
              bgcolor: 'primary.main',
              marginLeft: 1
            }} />
          </motion.div>
        )}
      </ListItemButton>
    </motion.div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Finance App
          </Typography>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={menuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                {(user?.username) ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer - боковое меню - всегда временное для всех размеров экрана */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Улучшает производительность открытия
          BackdropProps: { 
            style: { backgroundColor: 'transparent' } // Прозрачный бэкдроп
          }
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(25, 25, 25, 0.95)', // Немного прозрачный фон
            backdropFilter: 'blur(8px)', // Эффект размытия
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            borderRight: theme => `1px solid ${theme.palette.divider}`,
            color: '#fff' // Белый текст для лучшей читаемости
          },
        }}
      >
        <Toolbar /> {/* Пространство для AppBar */}
        <Box sx={{ p: 3 }}> {/* Увеличил отступы */}
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
            FINANCE APP
          </Typography>
          
          <List sx={{ mt: 2 }}>
            {menuItems.map((item) => (
              <NavListItem
                key={item.path}
                icon={item.icon}
                text={item.text}
                path={item.path}
                isSelected={location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.includes(item.path))}
              />
            ))}
          </List>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <List sx={{ p: 2 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Выйти из аккаунта"
                primaryTypographyProps={{
                  color: 'error.main',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      {/* Main Content - всегда занимает все доступное пространство */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          mt: '64px', // Высота AppBar
          p: 0, // Убираем отступы внешнего бокса
          display: 'flex',
          justifyContent: 'center', // Центрируем содержимое горизонтально
          // Убираем margin-left, который зависит от состояния меню
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container 
          sx={{ 
            py: 3,
            px: { xs: 2, sm: 3 },
            mx: 'auto',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start', // Выравниваем контент по левому краю
            width: '100%',
            maxWidth: { 
              xs: '100%',
              sm: '100%',
              md: '1200px'  // Увеличиваем максимальную ширину для больших экранов
            }
          }}
          disableGutters
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
