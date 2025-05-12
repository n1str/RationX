import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import transactionsReducer from './slices/transactionsSlice';
import statisticsReducer from './slices/statisticsSlice';

// Проверяем доступность localStorage для предотвращения ошибок при запуске
const checkLocalStorage = () => {
  try {
    const storage = window.localStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    console.error('LocalStorage недоступен:', e);
    return false;
  }
};

// Инициализация хранилища с проверкой доступности localStorage
if (!checkLocalStorage()) {
  // Очистим localStorage если он недоступен или поврежден
  try {
    localStorage.clear();
  } catch (e) {
    console.error('Не удалось очистить localStorage:', e);
  }
}

const logStoreState = () => {
  const state: RootState = store.getState();
  console.log('Текущее состояние хранилища:', state);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    transactions: transactionsReducer,
    statistics: statisticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(logStoreState);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
