import React, { createContext, useState, useContext } from 'react';

// 1. Crear el Contexto
const AppContext = createContext();

// 2. Crear el Proveedor del Contexto
export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' o 'dark'
  const [userRole, setUserRole] = useState('user'); // 'user' o 'admin'

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleUserRole = () => {
    setUserRole(prevRole => (prevRole === 'user' ? 'admin' : 'user'));
  };

  const value = {
    theme,
    toggleTheme,
    userRole,
    toggleUserRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 3. Hook personalizado para usar el contexto fácilmente
export const useAppContext = () => {
  return useContext(AppContext);
};