import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
