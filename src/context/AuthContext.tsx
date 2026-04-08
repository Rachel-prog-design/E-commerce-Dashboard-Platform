import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, AuthState } from '../types/index';
import apiClient from '../lib/axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Admin bypass
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 0,
        name: 'Administrator',
        email: ADMIN_EMAIL,
        role: 'ADMIN',
      };
      const fakeToken = 'admin-static-token';
      setUser(adminUser);
      setToken(fakeToken);
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return;
    }

    // Regular user login
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token } = response.data;

    localStorage.setItem('token', access_token);

    // Fetch profile
    const profileRes = await apiClient.get('/auth/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profileData = profileRes.data;
    const loggedInUser: User = {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      role: (profileData.role?.toUpperCase() as UserRole) || 'USER',
    };

    setUser(loggedInUser);
    setToken(access_token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        userRole: user?.role ?? null,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};