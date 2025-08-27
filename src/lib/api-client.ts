import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use environment variable for API URL, fallback to localhost for development
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
    
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1/admin`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zido_admin_token');
    }
    return null;
  }

  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zido_admin_token');
      localStorage.removeItem('zido_admin_user');
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zido_admin_token', token);
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  // Authentication requests without /admin prefix
  async authPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const fullURL = `${this.baseURL}/api/v1${url}`;
    const authConfig = {
      ...config,
      baseURL: `${this.baseURL}/api/v1`, // Use base API path without /admin
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config?.headers,
      },
      timeout: 30000,
    };

    const token = this.getAuthToken();
    if (token && url !== '/login') {
      authConfig.headers = {
        ...authConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (typeof window !== 'undefined') {
      console.log('[apiClient.authPost] baseURL:', authConfig.baseURL, 'url:', url, 'fullURL:', fullURL);
    }

    const response = await axios.post(url, data, authConfig);
    return response.data;
  }

  async authGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const fullURL = `${this.baseURL}/api/v1${url}`;
    const authConfig = {
      ...config,
      baseURL: `${this.baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config?.headers,
      },
      timeout: 30000,
    };

    const token = this.getAuthToken();
    if (token) {
      authConfig.headers = {
        ...authConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    if (typeof window !== 'undefined') {
      console.log('[apiClient.authGet] baseURL:', authConfig.baseURL, 'url:', url, 'fullURL:', fullURL);
    }

    const response = await axios.get(url, authConfig);
    return response.data;
  }

  // File upload helper
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, string | number | boolean>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, String(additionalData[key]));
      });
    }

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
