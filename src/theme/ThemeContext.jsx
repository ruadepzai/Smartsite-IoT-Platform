import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { getThemeConfig } from './themeConfig';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme-mode');
      if (savedTheme !== null) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Không thể lưu theme vào localStorage:', e);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const themeConfig = getThemeConfig(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
