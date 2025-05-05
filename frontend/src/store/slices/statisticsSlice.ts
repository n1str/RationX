import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import statisticsService, { 
  GeneralStatistics, 
  CategoryStatistics, 
  PeriodStatistics 
} from '../../services/statisticsService';

interface StatisticsState {
  general: GeneralStatistics | null;
  byCategory: CategoryStatistics[];
  byPeriod: PeriodStatistics[];
  lastMonth: PeriodStatistics | null;
  lastYear: PeriodStatistics[];
  loading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  general: null,
  byCategory: [],
  byPeriod: [],
  lastMonth: null,
  lastYear: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchGeneralStatistics = createAsyncThunk(
  'statistics/fetchGeneral',
  async (_, { rejectWithValue }) => {
    try {
      console.log('StatisticsSlice: запрос общей статистики...');
      const response = await statisticsService.getGeneralStatistics();
      console.log('StatisticsSlice: получена общая статистика:', response);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch general statistics';
      return rejectWithValue(message);
    }
  }
);

export const fetchStatisticsByCategory = createAsyncThunk(
  'statistics/fetchByCategory',
  async (_, { rejectWithValue }) => {
    try {
      return await statisticsService.getStatisticsByCategory();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch statistics by category';
      return rejectWithValue(message);
    }
  }
);

export const fetchStatisticsByPeriod = createAsyncThunk(
  'statistics/fetchByPeriod',
  async ({ start, end }: { start: string; end: string }, { rejectWithValue }) => {
    try {
      return await statisticsService.getStatisticsByPeriod(start, end);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch statistics by period';
      return rejectWithValue(message);
    }
  }
);

export const fetchStatisticsByType = createAsyncThunk(
  'statistics/fetchByType',
  async (type: 'DEBIT' | 'CREDIT', { rejectWithValue }) => {
    try {
      return await statisticsService.getStatisticsByType(type);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || `Failed to fetch statistics for ${type}`;
      return rejectWithValue(message);
    }
  }
);

export const fetchLastMonthStatistics = createAsyncThunk(
  'statistics/fetchLastMonth',
  async (_, { rejectWithValue }) => {
    try {
      console.log('StatisticsSlice: запрос статистики за последний месяц...');
      const response = await statisticsService.getLastMonthStatistics();
      console.log('StatisticsSlice: получена статистика за последний месяц:', response);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch last month statistics';
      return rejectWithValue(message);
    }
  }
);

export const fetchLastYearStatistics = createAsyncThunk(
  'statistics/fetchLastYear',
  async (_, { rejectWithValue }) => {
    try {
      return await statisticsService.getLastYearStatistics();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch last year statistics';
      return rejectWithValue(message);
    }
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch general statistics
      .addCase(fetchGeneralStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('StatisticsSlice: начало загрузки общей статистики...');
      })
      .addCase(fetchGeneralStatistics.fulfilled, (state, action: PayloadAction<GeneralStatistics>) => {
        state.general = action.payload;
        state.loading = false;
        console.log('StatisticsSlice: общая статистика успешно загружена:', action.payload);
      })
      .addCase(fetchGeneralStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('StatisticsSlice: ошибка загрузки общей статистики:', action.payload);
      })
      
      // Fetch statistics by category
      .addCase(fetchStatisticsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatisticsByCategory.fulfilled, (state, action: PayloadAction<CategoryStatistics[]>) => {
        state.byCategory = action.payload;
        state.loading = false;
      })
      .addCase(fetchStatisticsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch statistics by period
      .addCase(fetchStatisticsByPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatisticsByPeriod.fulfilled, (state, action: PayloadAction<PeriodStatistics[]>) => {
        state.byPeriod = action.payload;
        state.loading = false;
      })
      .addCase(fetchStatisticsByPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch last month statistics
      .addCase(fetchLastMonthStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastMonthStatistics.fulfilled, (state, action: PayloadAction<PeriodStatistics>) => {
        state.lastMonth = action.payload;
        state.loading = false;
      })
      .addCase(fetchLastMonthStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch last year statistics
      .addCase(fetchLastYearStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastYearStatistics.fulfilled, (state, action: PayloadAction<PeriodStatistics[]>) => {
        state.lastYear = action.payload;
        state.loading = false;
      })
      .addCase(fetchLastYearStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = statisticsSlice.actions;

export default statisticsSlice.reducer;
