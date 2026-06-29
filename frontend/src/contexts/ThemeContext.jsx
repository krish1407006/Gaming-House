import React, { createContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isAnimated, setIsAnimated] = useState(true);

  const applyTheme = useCallback((themeName, highContrast = false) => {
    const root = document.documentElement;
    let actualTheme = themeName;
    
    if (themeName === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Remove all theme classes
    document.body.classList.remove('dark-theme', 'light-theme', 'high-contrast');
    
    // Apply high contrast if enabled
    if (highContrast) {
      document.body.classList.add('high-contrast');
      return;
    }
    
    if (actualTheme === 'light') {
      root.style.setProperty('--bg-primary', '#f0f0ff');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-tertiary', '#e8e8f0');
      root.style.setProperty('--text-primary', '#1a1a2e');
      root.style.setProperty('--text-secondary', '#5a5a7a');
      root.style.setProperty('--text-muted', '#8a8aaa');
      root.style.setProperty('--accent-color', '#0066cc');
      root.style.setProperty('--accent-color-rgb', '0, 102, 204');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #0066cc 0%, #cc0066 100%)');
      root.style.setProperty('--accent-hover', '#0055aa');
      root.style.setProperty('--border-color', '#d0d0e0');
      root.style.setProperty('--border-hover', 'var(--accent-color)');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--card-shadow', 'rgba(0, 102, 204, 0.1)');
      root.style.setProperty('--input-bg', '#ffffff');
      root.style.setProperty('--input-border', '#d0d0e0');
      root.style.setProperty('--button-primary', 'var(--accent-color)');
      root.style.setProperty('--button-primary-hover', 'var(--accent-hover)');
      root.style.setProperty('--button-secondary', '#f1f3f4');
      root.style.setProperty('--button-secondary-hover', '#e8eaed');
      document.body.classList.add('light-theme');
    } else {
      root.style.setProperty('--bg-primary', '#0b0b16');
      root.style.setProperty('--bg-secondary', '#16162a');
      root.style.setProperty('--bg-tertiary', '#1c1c3a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#9ca3cf');
      root.style.setProperty('--text-muted', '#6b6b9a');
      root.style.setProperty('--accent-color', '#00e5ff');
      root.style.setProperty('--accent-color-rgb', '0, 229, 255');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #00e5ff 0%, #ff2d95 100%)');
      root.style.setProperty('--accent-hover', '#00ccdd');
      root.style.setProperty('--border-color', '#2a2a4a');
      root.style.setProperty('--border-hover', 'var(--accent-color)');
      root.style.setProperty('--card-bg', '#16162a');
      root.style.setProperty('--card-shadow', 'rgba(0, 229, 255, 0.08)');
      root.style.setProperty('--input-bg', '#16162a');
      root.style.setProperty('--input-border', '#2a2a4a');
      root.style.setProperty('--button-primary', 'var(--accent-color)');
      root.style.setProperty('--button-primary-hover', 'var(--accent-hover)');
      root.style.setProperty('--button-secondary', '#2a2a4a');
      root.style.setProperty('--button-secondary-hover', '#3a3a5a');
      document.body.classList.add('dark-theme');
    }
    
    // Add theme switching animation
    if (isAnimated) {
      document.body.classList.add('theme-switching');
      setTimeout(() => {
        document.body.classList.remove('theme-switching');
      }, 300);
    }
  }, [isAnimated]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme, isHighContrast);
    localStorage.setItem('gaminghouse_theme', newTheme);
  }, [theme, isHighContrast, applyTheme]);

  const setThemeMode = useCallback((newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme, isHighContrast);
    localStorage.setItem('gaminghouse_theme', newTheme);
  }, [isHighContrast, applyTheme]);

  const toggleHighContrast = useCallback(() => {
    const newHighContrast = !isHighContrast;
    setIsHighContrast(newHighContrast);
    applyTheme(theme, newHighContrast);
    localStorage.setItem('gaminghouse_high_contrast', newHighContrast.toString());
  }, [isHighContrast, theme, applyTheme]);

  const getThemeStyles = useCallback(() => {
    return {
      backgroundColor: `var(--bg-primary)`,
      color: `var(--text-primary)`,
    };
  }, []);

  const getAccentStyles = useCallback(() => {
    return {
      color: `var(--accent-color)`,
    };
  }, []);

  const getButtonStyles = useCallback((variant = 'primary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: `var(--accent-color)`,
          color: `var(--bg-primary)`,
        };
      case 'secondary':
        return {
          backgroundColor: `var(--bg-secondary)`,
          color: `var(--text-primary)`,
          border: `1px solid var(--border-color)`,
        };
      case 'danger':
        return {
          backgroundColor: `var(--error-color, #ef4444)`,
          color: `white`,
        };
      case 'success':
        return {
          backgroundColor: `var(--success-color, #10b981)`,
          color: `white`,
        };
      default:
        return {
          backgroundColor: `var(--accent-color)`,
          color: `var(--bg-primary)`,
        };
    }
  }, []);

  useEffect(() => {
    // Load theme from localStorage
  const savedTheme = localStorage.getItem('gaminghouse_theme') || 'dark';
  const savedHighContrast = localStorage.getItem('gaminghouse_high_contrast') === 'true';
    
    setTheme(savedTheme);
    setIsHighContrast(savedHighContrast);
    
    // Apply theme immediately
    setTimeout(() => {
      applyTheme(savedTheme, savedHighContrast);
    }, 0);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'auto') {
        applyTheme('auto', savedHighContrast);
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [applyTheme]);

  const value = {
    theme,
    isHighContrast,
    isAnimated,
    setTheme: setThemeMode,
    toggleTheme,
    toggleHighContrast,
    setIsAnimated,
    applyTheme,
    getThemeStyles,
    getAccentStyles,
    getButtonStyles,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeProvider;