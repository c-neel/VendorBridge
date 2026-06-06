'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  employee?: any;
  vendor?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('vendorbridge_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('vendorbridge_token');
      localStorage.removeItem('vendorbridge_refresh_token');
      localStorage.removeItem('vendorbridge_user');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    localStorage.setItem('vendorbridge_token', data.accessToken);
    localStorage.setItem('vendorbridge_refresh_token', data.refreshToken);
    localStorage.setItem('vendorbridge_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(formData: any) {
    const data = await api.register(formData);
    localStorage.setItem('vendorbridge_token', data.accessToken);
    localStorage.setItem('vendorbridge_refresh_token', data.refreshToken);
    localStorage.setItem('vendorbridge_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.logout();
    } catch (e) {}
    localStorage.removeItem('vendorbridge_token');
    localStorage.removeItem('vendorbridge_refresh_token');
    localStorage.removeItem('vendorbridge_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
