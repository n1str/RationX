import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import transactionService, { Transaction } from '../../services/transactionService';

interface TransactionsState {
  items: Transaction[];
  selectedTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    type?: string;
    categoryId?: number;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  };
}

const initialState: TransactionsState = {
  items: [],
  selectedTransaction: null,
  loading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionService.getAllTransactions();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionsByStatus = createAsyncThunk(
  'transactions/fetchByStatus',
  async (status: Transaction['status'], { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionsByStatus(status);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch ${status} transactions`;
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionsByType = createAsyncThunk(
  'transactions/fetchByType',
  async (type: 'DEBIT' | 'CREDIT', { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionsByType(type);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch ${type} transactions`;
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionsByCategory = createAsyncThunk(
  'transactions/fetchByCategory',
  async (categoryId: number, { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionsByCategory(categoryId);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch transactions for category ${categoryId}`;
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionsByDateRange = createAsyncThunk(
  'transactions/fetchByDateRange',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionsByDateRange(startDate, endDate);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch transactions by date range';
      return rejectWithValue(message);
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await transactionService.getTransactionById(id);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch transaction with ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData: Transaction, { rejectWithValue }) => {
    try {
      return await transactionService.createTransaction(transactionData);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create transaction';
      return rejectWithValue(message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }: { id: number; data: Transaction }, { rejectWithValue }) => {
    try {
      return await transactionService.updateTransaction(id, data);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to update transaction with ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const success = await transactionService.deleteTransaction(id);
      if (success) {
        return id;
      }
      return rejectWithValue(`Failed to delete transaction with ID ${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to delete transaction with ID ${id}`;
      return rejectWithValue(message);
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<TransactionsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions by status
      .addCase(fetchTransactionsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByStatus.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions by type
      .addCase(fetchTransactionsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByType.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions by category
      .addCase(fetchTransactionsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByCategory.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions by date range
      .addCase(fetchTransactionsByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByDateRange.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionsByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.selectedTransaction = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        if (!Array.isArray(state.items)) {
          state.items = [action.payload];
        } else {
          state.items = [action.payload, ...state.items];
        }
        state.loading = false;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.items = state.items.map(transaction => 
          transaction.id === action.payload.id ? action.payload : transaction
        );
        state.selectedTransaction = action.payload;
        state.loading = false;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<number>) => {
        if (Array.isArray(state.items)) {
          state.items = state.items.filter(item => item?.id !== action.payload);
        }
        if (state.selectedTransaction?.id === action.payload) {
          state.selectedTransaction = null;
        }
        state.loading = false;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTransaction, clearError, setFilters, clearFilters } = transactionsSlice.actions;

export default transactionsSlice.reducer;
