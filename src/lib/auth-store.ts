import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';
import type { Admin, LoginRequest } from '@/types/zidobid';
import { adminLogin, adminLogout, getAdminProfile } from '@/lib/api/generated';

interface AuthState {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminLogin(credentials);

          // Store auth data
          if (typeof window !== 'undefined') {
            localStorage.setItem('zido_admin_token', response.token);
            localStorage.setItem('zido_admin_user', JSON.stringify(response.admin));
          }

          set({
            admin: response.admin,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          message.success('Login successful!');
        } catch (error: unknown) {
          console.error('Login error:', error);

          let errorMessage = 'Login failed';
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            admin: null,
            token: null,
          });

          message.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        try {
          if (token) {
            await adminLogout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Always clear local state regardless of API response
          if (typeof window !== 'undefined') {
            localStorage.removeItem('zido_admin_token');
            localStorage.removeItem('zido_admin_user');
          }

          set({
            admin: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          message.success('Logged out successfully');
        }
      },

      refreshProfile: async () => {
        const { token } = get();
        if (!token) {
          set({ admin: null, isAuthenticated: false });
          return;
        }
        try {
          const profile = await getAdminProfile();
          set({ admin: profile });
          if (typeof window !== 'undefined') {
            localStorage.setItem('zido_admin_user', JSON.stringify(profile));
          }
        } catch (error) {
          console.error('Failed to refresh profile:', error);
          // If profile fetch fails, logout user
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'zido-auth-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After hydration, check if we have stored auth data
        if (state?.token && state?.admin) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

// Initialize auth state on app startup
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('zido_admin_token');
  const storedAdmin = localStorage.getItem('zido_admin_user');

  if (storedToken && storedAdmin) {
    try {
      const admin = JSON.parse(storedAdmin);
      useAuthStore.setState({
        admin,
        token: storedToken,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to parse stored admin data:', error);
      localStorage.removeItem('zido_admin_token');
      localStorage.removeItem('zido_admin_user');
    }
  }
}
