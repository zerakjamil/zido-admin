// Simplified API client using the new auth store
import type { Admin, LoginRequest } from '@/types/zidobid';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zidobid.com';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Auto-attach token for authenticated requests
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('zido_admin_token') 
    : null;
    
  if (token && !endpoint.includes('/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

// API client object
export const api = {
  auth: {
    login: (credentials: LoginRequest) => 
      request<{ admin: Admin; token: string }>(
        // FIX: correct endpoint path
        '/api/v1/admin/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      ),
    
    logout: () => 
      request('/api/v1/admin/logout', {
        method: 'POST',
      }),
    
    getProfile: () => 
      request<Admin>('/api/v1/admin/profile', {
        method: 'GET',
      }),
  },
  
  users: {
    list: (params?: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return request(`/api/v1/admin/users${queryString ? `?${queryString}` : ''}`);
    },
    
    get: (id: number) => 
      request(`/api/v1/admin/users/${id}`),
    
    create: (data: unknown) => 
      request('/api/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: number, data: unknown) => 
      request(`/api/v1/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number) => 
      request(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
      }),
  },

  // Add other endpoints as needed
  auctions: {
    list: (params?: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return request(`/api/v1/admin/auctions${queryString ? `?${queryString}` : ''}`);
    },
  },

  categories: {
    list: (params?: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return request(`/api/v1/admin/categories${queryString ? `?${queryString}` : ''}`);
    },
  },

  banners: {
    list: (params?: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return request(`/api/v1/admin/banners${queryString ? `?${queryString}` : ''}`);
    },
  },

  bids: {
    list: (params?: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const queryString = searchParams.toString();
      return request(`/api/v1/admin/bids${queryString ? `?${queryString}` : ''}`);
    },
  },
};

// Legacy exports for backward compatibility
export class ApiClient {
  async get<T>(url: string, options?: { params?: Record<string, unknown> }): Promise<T> {
    let finalUrl = url;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            searchParams.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              searchParams.append(`${key}[${index}]`, String(item));
            });
          } else {
            // value is a primitive type (string, number, boolean)
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }
    return request<T>(finalUrl);
  }

  async post<T>(url: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<T> {
    return request<T>(url, {
      method: 'DELETE',
    });
  }

  // File upload helper
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, string | number | boolean>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        formData.append(key, String(value));
      });
    }

    return request<T>(url, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart/form-data
    });
  }

  // Multiple file upload helper
  async uploadFiles<T>(url: string, files: File[], additionalData?: Record<string, unknown>): Promise<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        if (Array.isArray(value)) {
          value.forEach((item: unknown, index: number) => {
            formData.append(`${key}[${index}]`, String(item));
          });
        } else {
          formData.append(key, String(value));
        }
      });
    }

    return request<T>(url, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for multipart/form-data
    });
  }
}

export const apiClient = new ApiClient();
