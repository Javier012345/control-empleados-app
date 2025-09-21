import React from 'react';
import Navigation from './navigation/navigation';
import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    // Envuelve tu navegación con el proveedor
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
