import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchAllCategories,
  fetchCategoriesByType,
  deleteCategory,
  clearError,
} from '../../store/slices/categoriesSlice';
import { Category } from '../../services/categoryService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const getTabProps = (index: number) => {
  return {
    id: `category-tab-${index}`,
    'aria-controls': `category-tabpanel-${index}`,
  };
};

const CategoriesList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { items: categories = [], loading, error } = useAppSelector(state => state.categories);
  
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  useEffect(() => {
    if (tabValue === 0) {
      dispatch(fetchAllCategories());
    } else if (tabValue === 1) {
      dispatch(fetchCategoriesByType('DEBIT'));
    } else if (tabValue === 2) {
      dispatch(fetchCategoriesByType('CREDIT'));
    }
  }, [dispatch, tabValue]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (categoryToDelete?.id) {
      try {
        await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
        setSnackbarMessage(`Категория "${categoryToDelete.name}" удалена успешно`);
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage('Не удалось удалить категорию');
        setSnackbarOpen(true);
      }
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const filteredCategories = Array.isArray(categories)
    ? categories.filter(category =>
        (category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Categories for current tab
  const displayedCategories = Array.isArray(filteredCategories)
    ? (tabValue === 0
        ? filteredCategories
        : tabValue === 1
          ? filteredCategories.filter(cat => cat?.type === 'DEBIT')
          : filteredCategories.filter(cat => cat?.type === 'CREDIT'))
    : [];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Категории
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/categories/new')}
          sx={{ borderRadius: 1, px: 2, py: 1 }}
        >
          Добавить категорию
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              fullWidth
              variant="outlined"
              size="medium"
              placeholder="Поиск категорий..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <Tab label="Все категории" {...getTabProps(0)} />
              <Tab 
                label="Расходы" 
                icon={<TrendingDown fontSize="small" />} 
                iconPosition="start"
                {...getTabProps(1)} 
              />
              <Tab 
                label="Доход" 
                icon={<TrendingUp fontSize="small" />} 
                iconPosition="start"
                {...getTabProps(2)} 
              />
            </Tabs>
          </Box>
        </Stack>
      </Paper>
      
      <TabPanel value={tabValue} index={0}>
        <CategoriesGrid 
          categories={displayedCategories} 
          loading={loading} 
          onEdit={(id) => navigate(`/categories/${id}/edit`)}
          onDelete={handleDeleteClick}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <CategoriesGrid 
          categories={displayedCategories} 
          loading={loading} 
          onEdit={(id) => navigate(`/categories/${id}/edit`)}
          onDelete={handleDeleteClick}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <CategoriesGrid 
          categories={displayedCategories} 
          loading={loading} 
          onEdit={(id) => navigate(`/categories/${id}/edit`)}
          onDelete={handleDeleteClick}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />
      </TabPanel>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы уверены, что хотите удалить категорию "{categoryToDelete?.name}"? 
            Это действие невозможно отменить и может повлиять на транзакции, которые используют эту категорию.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface CategoriesGridProps {
  categories: Category[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (category: Category) => void;
  containerVariants: any;
  itemVariants: any;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  containerVariants,
  itemVariants
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (categories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          Категории не найдены
        </Typography>
      </Box>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: { xs: 1.5, sm: 2 },
        width: '100%',
        maxWidth: '100%',
        mx: 'auto'
      }}>
        {categories.map((category) => (
          <motion.div key={category.id} variants={itemVariants}>
            <Card sx={{ 
              borderRadius: 1.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '120px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: (theme) => theme.shadows[3],
              }
            }}>
              <CardContent sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.5, sm: 2 },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: '120px', sm: '140px', md: '160px' }
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Chip 
                    label={category.type === 'DEBIT' ? 'Расход' : 'Доход'} 
                    color={category.type === 'DEBIT' ? 'error' : 'success'}
                    size="small"
                    sx={{ height: 22, fontSize: 11 }}
                  />
                </Box>
                {category.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2, 
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.8rem'
                    }}
                  >
                    {category.description}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => onEdit(category.id!)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => onDelete(category)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
};

export default CategoriesList;
