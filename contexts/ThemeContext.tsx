import React, { createContext, useContext, useState } from 'react';

export interface Theme {
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  primaryColor: string;
  errorColor: string;
  cardBackground: string;
}

const lightTheme: Theme = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  secondaryTextColor: '#666666',
  primaryColor: '#007AFF',
  errorColor: '#FF3B30',
  cardBackground: '#F2F2F7',
};

const darkTheme: Theme = {
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  secondaryTextColor: '#AEAEB2',
  primaryColor: '#0A84FF',
  errorColor: '#FF453A',
  cardBackground: '#1C1C1E',
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 