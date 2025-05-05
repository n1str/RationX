import React, { useState } from 'react';
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

const drawerWidth = 240;

const Layout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    if (isMobile) {
      setOpen(false);
    }
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
      <AppBar
        position="fixed"
        sx={{
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
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
      
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(180deg, #1a1a2e 0%, #121212 100%)' 
              : 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
            borderRight: theme => theme.palette.mode === 'dark' 
              ? '1px solid rgba(255,255,255,0.05)' 
              : '1px solid rgba(0,0,0,0.05)',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '5px 0 15px rgba(0,0,0,0.2)' 
              : '5px 0 15px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            FINANCE APP
          </Typography>
          {!isMobile && (
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <List component={motion.ul}>
            {menuItems.map((item, index) => (
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
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  color: 'error',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: 8,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Layout;
