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
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#fafafa');
      root.style.setProperty('--bg-tertiary', '#f0f0f0');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#525252');
      root.style.setProperty('--text-muted', '#a3a3a3');
      root.style.setProperty('--accent-color', '#000000');
      root.style.setProperty('--accent-color-rgb', '0, 0, 0');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #000000 0%, #525252 100%)');
      root.style.setProperty('--accent-hover', '#262626');
      root.style.setProperty('--border-color', '#e5e5e5');
      root.style.setProperty('--border-hover', 'var(--accent-color)');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--card-shadow', 'rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--input-bg', '#ffffff');
      root.style.setProperty('--input-border', '#e5e5e5');
      root.style.setProperty('--button-primary', 'var(--accent-color)');
      root.style.setProperty('--button-primary-hover', 'var(--accent-hover)');
      root.style.setProperty('--button-secondary', '#f0f0f0');
      root.style.setProperty('--button-secondary-hover', '#e5e5e5');
      document.body.classList.add('light-theme');
    } else {
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#0a0a0a');
      root.style.setProperty('--bg-tertiary', '#141414');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a3a3a3');
      root.style.setProperty('--text-muted', '#525252');
      root.style.setProperty('--accent-color', '#ffffff');
      root.style.setProperty('--accent-color-rgb', '255, 255, 255');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)');
      root.style.setProperty('--accent-hover', '#e5e5e5');
      root.style.setProperty('--border-color', '#1a1a1a');
      root.style.setProperty('--border-hover', 'var(--accent-color)');
      root.style.setProperty('--card-bg', '#0a0a0a');
      root.style.setProperty('--card-shadow', 'rgba(255, 255, 255, 0.03)');
      root.style.setProperty('--input-bg', '#0a0a0a');
      root.style.setProperty('--input-border', '#1a1a1a');
      root.style.setProperty('--button-primary', 'var(--accent-color)');
      root.style.setProperty('--button-primary-hover', 'var(--accent-hover)');
      root.style.setProperty('--button-secondary', '#1a1a1a');
      root.style.setProperty('--button-secondary-hover', '#262626');
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