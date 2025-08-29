import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL strategy
// - NEXT_PUBLIC_API_URL should be like: https://api.zidobid.com
// - We will append /api automatically when paths start with /v1
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zidobid.com';

// Token provider reads from localStorage (browser) or returns null on server
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('zido_admin_token');
  } catch {
    return null;
  }
};

// Single Axios instance for the app
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Attach auth header and ensure base path correctness
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (config.url) {
    // Prefix '/api' for any OpenAPI v1 path
    if (config.url.startsWith('/v1/')) {
      config.url = config.url.replace(/^\/v1\//, '/api/v1/');
    }
    // Normalize accidental duplicates like '/api/v1/api/v1'
    config.url = config.url.replace(/\/(api\/v1\/)+/g, '/api/v1/');
  }

  if (process.env.NODE_ENV !== 'production') {
    const redactedHeaders = { ...(config.headers as Record<string, string>) };
    if (redactedHeaders && redactedHeaders['Authorization']) {
      redactedHeaders['Authorization'] = 'Bearer ***redacted***';
    }
    console.debug('[API request]', {
      method: (config.method || 'get').toUpperCase(),
      url: `${API_BASE_URL}${config.url}`,
      headers: redactedHeaders,
      data: config.data,
    });
  }

  return config;
});

// Global response handling for auth and common errors
axiosClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[API response]', {
        url: response.config?.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status as number | undefined;
    const respData = error?.response?.data;

    if (process.env.NODE_ENV !== 'production') {
      const authHeader = error?.config?.headers?.Authorization ? 'Bearer ***redacted***' : undefined;
      console.debug('[API response error]', {
        url: error?.config?.url,
        status,
        data: respData,
        message: error?.message,
        headers: authHeader ? { Authorization: authHeader } : undefined,
      });
    }

    // Derive a useful error message from server response when possible
    let message = 'Request failed';
    if (respData) {
      if (typeof respData === 'string') {
        message = respData;
      } else if (typeof respData === 'object') {
        message = respData.message || respData.error || message;
      }
    } else if (typeof error?.message === 'string' && error.message.trim().length > 0) {
      message = error.message;
    }

    if (status === 401 || status === 403) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zido_admin_token');
          localStorage.removeItem('zido_admin_user');
        } catch {}
        // Avoid redirect loop on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

// This mutator is used by Orval-generated functions
export const axiosMutator = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosClient.request<T>(config);
  return response.data;
};
