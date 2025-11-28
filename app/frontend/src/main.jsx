import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ParcellesPage, ParcelleDetailPage } from './pages/ParcellesPage';
import { CataloguePage, PlantDetailPage } from './pages/CataloguePage';
import { TachesPage } from './pages/TachesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/parcelles"
            element={
              <ProtectedRoute>
                <ParcellesPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/parcelles/:id"
            element={
              <ProtectedRoute>
                <ParcelleDetailPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/catalogue"
            element={
              <ProtectedRoute>
                <CataloguePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/catalogue/:id"
            element={
              <ProtectedRoute>
                <PlantDetailPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/taches"
            element={
              <ProtectedRoute>
                <TachesPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
