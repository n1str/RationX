import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import categoryService, { Category } from '../../services/categoryService';

interface CategoriesState {
  items: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAllCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Ошибка при получении категорий';
      return rejectWithValue(message);
    }
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'categories/fetchByType',
  async (type: 'DEBIT' | 'CREDIT', { rejectWithValue }) => {
    try {
      return await categoryService.getCategoriesByType(type);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Ошибка при получении категорий типа ${type}`;
      return rejectWithValue(message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Ошибка при получении категории с ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData: Category, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(categoryData);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Ошибка при создании категории';
      return rejectWithValue(message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: number; data: Category }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, data);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Ошибка при обновлении категории с ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Ошибка при удалении категории с ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Начало загрузки всех категорий...');
      })
      .addCase(fetchAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.items = action.payload;
        state.loading = false;
        console.log('Категории успешно загружены:', action.payload.length, 'элементов');
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Ошибка загрузки категорий:', action.payload);
      })
      
      // Fetch categories by type
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Начало загрузки категорий по типу...');
      })
      .addCase(fetchCategoriesByType.fulfilled, (state, action: PayloadAction<Category[]>) => {
        // Обновляем только категории соответствующего типа, сохраняя остальные
        const matchType = action.payload[0]?.type || null;
        if (matchType) {
          // Сохраняем категории другого типа
          const otherTypeCategories = state.items.filter(cat => cat.type !== matchType);
          // Добавляем новые категории
          state.items = [...otherTypeCategories, ...action.payload];
        } else {
          state.items = action.payload;
        }
        state.loading = false;
        console.log('Категории по типу успешно загружены:', action.payload.length, 'элементов');
      })
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Ошибка загрузки категорий по типу:', action.payload);
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Начало загрузки категории по ID...');
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.selectedCategory = action.payload;
        state.loading = false;
        console.log('Категория успешно загружена:', action.payload);
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.items = state.items.map(category => 
          category.id === action.payload.id ? action.payload : category
        );
        state.selectedCategory = action.payload;
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(category => category.id !== action.payload);
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
        state.loading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCategory, clearError } = categoriesSlice.actions;

export default categoriesSlice.reducer;
