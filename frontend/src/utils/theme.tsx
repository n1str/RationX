import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material';
import safeStorage from './storage';

// Палитры для светлой и темной темы
const lightPalette = {
  primary: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
  },
  background: {
    default: '#f9fafb',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
  },
  divider: 'rgba(0,0,0,0.08)',
};

const darkPalette = {
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9333ea',
    light: '#a855f7',
    dark: '#7e22ce',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
  },
  background: {
    default: '#111827',
    paper: '#1f2937',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    disabled: '#6b7280',
  },
  divider: 'rgba(255,255,255,0.08)',
};

// Создаем контекст темы
interface ThemeContextProps {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: 'dark',
  toggleTheme: () => {},
});

// Настраиваемые параметры темы для разных режимов
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light' ? lightPalette : darkPalette),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 8px -2px rgba(37, 99, 235, 0.3)' 
              : '0 4px 8px -2px rgba(59, 130, 246, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          ...(mode === 'dark' && {
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }),
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0px 2px 10px 0px rgba(0, 0, 0, 0.05)'
            : '0px 2px 10px 0px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0px 4px 15px 0px rgba(0, 0, 0, 0.07)'
            : '0px 4px 15px 0px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light'
              ? '0 12px 20px -10px rgba(0, 0, 0, 0.1)'
              : '0 12px 20px -10px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          padding: '8px 12px',
          backgroundColor: mode === 'light' ? '#1f2937' : '#f9fafb',
          color: mode === 'light' ? '#fff' : '#111827',
          boxShadow: mode === 'light'
            ? '0px 2px 14px -2px rgba(0, 0, 0, 0.2)'
            : '0px 2px 14px -2px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
});

// Провайдер темы с возможностью переключения
interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  // Получаем предпочтения пользователя из хранилища или системных настроек
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [mode, setMode] = useState<PaletteMode>(
    safeStorage.get<PaletteMode>('themeMode') || (prefersDarkMode ? 'dark' : 'light')
  );

  // Создаем тему
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Функция переключения темы
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    safeStorage.set('themeMode', newMode);
  };

  // Следим за системными настройками темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (!safeStorage.has('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Хук для использования темы
export const useCustomTheme = () => useContext(ThemeContext);

export default CustomThemeProvider;
