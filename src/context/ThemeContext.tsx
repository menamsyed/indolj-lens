import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, darkColors, lightColors } from '../styles/colors';

const THEME_STORAGE_KEY = '@indolj_dark_mode_enabled';

export interface ThemeContextType {
  isDarkMode: boolean;
  isHydrating: boolean;
  toggleDarkMode: () => void;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Functional toggle + persistence only for now — this does not restructure colors.ts or
// re-theme existing screens, it just tracks and remembers the user's preference so Settings
// has something real to bind to. App-wide dark styling is a deliberate follow-up phase.
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  useEffect(() => {
    const hydrateThemePreference = async (): Promise<void> => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        setIsDarkMode(stored === 'true');
      } finally {
        setIsHydrating(false);
      }
    };
    hydrateThemePreference();
  }, []);

  const toggleDarkMode = useCallback((): void => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const colors = useMemo((): Colors => (isDarkMode ? darkColors : lightColors), [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, isHydrating, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
