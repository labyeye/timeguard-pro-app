// context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
const themes = {
  light: {
    id: 'light',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F5F5F5',
    textColor: '#333333',
    primaryColor: '#4A6FFF',
    secondaryColor: '#FF6B6B',
    accentColor: '#50E3A4',
    borderColor: '#E0E0E0',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    id: 'dark',
    backgroundColor: '#121212',
    cardBackground: '#1E1E1E',
    textColor: '#F5F5F5',
    primaryColor: '#6C8FFF',
    secondaryColor: '#FF8080',
    accentColor: '#64FFBD',
    borderColor: '#2C2C2C',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
};

// Create the context
export const ThemeContext = createContext();

// Create the provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme) {
          setTheme(themes[savedTheme] || themes.light);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = async () => {
    const newThemeId = theme.id === 'light' ? 'dark' : 'light';
    const newTheme = themes[newThemeId];
    
    try {
      await AsyncStorage.setItem('userTheme', newThemeId);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // If still loading, return null or a loading indicator
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};