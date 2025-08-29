import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';
import type { Admin, LoginRequest } from '@/types/zidobid';
import { adminLogin, adminLogout, getAdminProfile } from '@/lib/api/generated';
import type { LoginResponse } from '@/lib/api/generated/models/loginResponse';

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

const setAuthCookie = (token: string | null) => {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  if (token) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    document.cookie = `zido_admin_token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    // Expire cookie
    document.cookie = 'zido_admin_token=; Path=/; Max-Age=0; SameSite=Lax';
  }
};

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
          const response = (await adminLogin(credentials)) as unknown as Partial<LoginResponse>;

          // Dev-only safe log of the API response (redacted)
          if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
            console.debug('Login API response:', {
              hasToken: typeof response.token === 'string',
              tokenLength: typeof response.token === 'string' ? response.token.length : 0,
              admin: response.admin
                ? {
                    id: (response.admin as Partial<Admin>).id,
                    email: (response.admin as Partial<Admin>).email,
                    name: (response.admin as Partial<Admin>).name,
                  }
                : null,
            });
          }

          // Validate response shape defensively (tests may return partial shapes)
          const hasToken = typeof response.token === 'string' && response.token.length > 0;
          const adminObj = response.admin as Partial<Admin> | undefined;
          const hasAdmin = !!adminObj && typeof adminObj.email === 'string';

          if (!hasToken || !hasAdmin) {
            set({
              error: 'Malformed response from server',
              isLoading: false,
              isAuthenticated: false,
              admin: null,
              token: null,
            });
            message.error('Malformed response from server');
            return;
          }

          const token: string = response.token!; // safe after validation
          const adminData: Admin = response.admin as Admin; // safe after validation

          // Store auth data
          if (typeof window !== 'undefined') {
            localStorage.setItem('zido_admin_token', token);
            localStorage.setItem('zido_admin_user', JSON.stringify(adminData));
            setAuthCookie(token);
          }

          if (process.env.NODE_ENV !== 'production') {
            console.debug('Auth state set. Token stored in localStorage and cookie set.');
          }

          set({
            admin: adminData,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          message.success('Login successful!');
        } catch (error: unknown) {
          console.error('Login error:', error);

          let errorMessage = 'Login failed';
          if (error instanceof Error) {
            errorMessage = error.message === 'Network error' ? 'An unexpected error occurred. Please try again.' : error.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            admin: null,
            token: null,
          });

          message.error(errorMessage);
          // Do not rethrow; tests expect graceful handling without exceptions
          return;
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
            setAuthCookie(null);
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
      // Ensure cookie is present for middleware
      setAuthCookie(storedToken);
    } catch (error) {
      console.error('Failed to parse stored admin data:', error);
      localStorage.removeItem('zido_admin_token');
      localStorage.removeItem('zido_admin_user');
      setAuthCookie(null);
    }
  }
}
