'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { authService } from '../services/zidobid-api';
import type { Admin, LoginRequest } from '../types/zidobid';

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!admin;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('zido_admin_token');
        const storedAdmin = localStorage.getItem('zido_admin_user');

        if (token && storedAdmin) {
          setAdmin(JSON.parse(storedAdmin));
          // Optionally refresh profile to ensure it's up to date
          await refreshProfile();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // Store auth data
      localStorage.setItem('zido_admin_token', response.token);
      localStorage.setItem('zido_admin_user', JSON.stringify(response.admin));
      
      setAdmin(response.admin);
      message.success('Login successful!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      message.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      message.success('Logged out successfully');
      router.push('/login');
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setAdmin(profile);
      localStorage.setItem('zido_admin_user', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      clearAuthData();
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('zido_admin_token');
    localStorage.removeItem('zido_admin_user');
    setAdmin(null);
  };

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
