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
      const message = error.response?.data?.message || error.message || 'Failed to fetch categories';
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
      const message = error.response?.data?.message || error.message || `Failed to fetch ${type} categories`;
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
      const message = error.response?.data?.message || error.message || `Failed to fetch category with ID ${id}`;
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
      const message = error.response?.data?.message || error.message || 'Failed to create category';
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
      const message = error.response?.data?.message || error.message || `Failed to update category with ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await categoryService.deleteCategory(id);
      if (success) {
        return id;
      }
      return rejectWithValue(`Failed to delete category with ID ${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to delete category with ID ${id}`;
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
      })
      .addCase(fetchAllCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch categories by type
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesByType.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.selectedCategory = action.payload;
        state.loading = false;
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
