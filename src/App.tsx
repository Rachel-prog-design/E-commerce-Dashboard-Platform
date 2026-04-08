import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { queryClient } from '@/lib/queryClient';
import Layout from '@/components/layout/Layout';
import { UserRoute, AdminRoute } from '@/components/auth/ProtectedRoute';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProductFormPage from '@/pages/admin/ProductFormPage';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* User Protected */}
              <Route path="/checkout" element={<UserRoute><CheckoutPage /></UserRoute>} />
              <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />

              {/* Admin Protected */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products/new" element={<AdminRoute><ProductFormPage /></AdminRoute>} />
              <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductFormPage /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;