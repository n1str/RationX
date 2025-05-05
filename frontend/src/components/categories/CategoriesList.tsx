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
  
  const { items: categories, loading, error } = useAppSelector(state => state.categories);
  
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
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Categories for current tab
  const displayedCategories = tabValue === 0
    ? filteredCategories
    : tabValue === 1
      ? filteredCategories.filter(cat => cat.type === 'DEBIT')
      : filteredCategories.filter(cat => cat.type === 'CREDIT');
  
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Категории
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/categories/new')}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Добавить категорию
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск категорий..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
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
                  borderRadius: 2,
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
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 3 }}>
        {categories.map((category) => (
          <Box 
            key={category.id}
            sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 12px)', 
                md: 'calc(33.333% - 16px)', 
                lg: 'calc(25% - 18px)' 
              } 
            }}
          >
            <motion.div variants={itemVariants}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10,
                    display: 'flex',
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="category-actions"
                >
                  <Tooltip title="Редактировать категорию">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(category.id!)}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить категорию">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onDelete(category)}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: category.type === 'DEBIT' ? 'error.main' : 'success.main',
                        opacity: 0.8,
                        mr: 2,
                        mb: 1,
                      }}
                    >
                      {category.type === 'DEBIT' ? <TrendingDown /> : <TrendingUp />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {category.name}
                      </Typography>
                      <Chip 
                        label={category.type === 'DEBIT' ? 'Расход' : 'Доход'} 
                        size="small"
                        color={category.type === 'DEBIT' ? 'error' : 'success'}
                        sx={{ height: 24, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                  {category.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {category.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        ))}
      </Stack>
    </motion.div>
  );
};

export default CategoriesList;
