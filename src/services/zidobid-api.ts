import { api, apiClient } from '../lib/api-client';
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  Admin,
  DashboardStats,
  User,
  PaginatedResponse,
  UpdateUserRequest,
  SuspendUserRequest,
  AuctionItem,
  CreateAuctionItemRequest,
  UpdateAuctionItemRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PromotionalBanner,
  CreateBannerRequest,
  Bid,
  RevenueReport,
  UserActivityReport,
  AuctionStatistics,
} from '../types/zidobid';

// Authentication Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.auth.login(credentials);
    return {
      admin: response.admin,
      token: response.token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };
  },

  logout: async (): Promise<void> => {
    await api.auth.logout();
  },

  getProfile: async (): Promise<Admin> => {
    return api.auth.getProfile();
  },
};

// Dashboard Services
export const dashboardService = {
  getStats: async (period?: string): Promise<DashboardStats> => {
    const params = period ? { period } : {};
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard', { params });
    return response.data;
  },
};

// User Management Services
export const userService = {
  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<User>> => {
    return apiClient.get('/users', { params });
  },

  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  suspendUser: async (id: number, data: SuspendUserRequest): Promise<void> => {
    await apiClient.post(`/users/${id}/suspend`, data);
  },

  unsuspendUser: async (id: number): Promise<void> => {
    await apiClient.post(`/users/${id}/unsuspend`);
  },
};

// Auction Management Services
export const auctionService = {
  getAuctionItems: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    category_id?: number;
    featured?: boolean;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<AuctionItem>> => {
    return apiClient.get('/auction-items', { params });
  },

  getAuctionItem: async (id: number): Promise<AuctionItem> => {
    const response = await apiClient.get<ApiResponse<AuctionItem>>(`/auction-items/${id}`);
    return response.data;
  },

  createAuctionItem: async (data: CreateAuctionItemRequest): Promise<AuctionItem> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (key !== 'images') {
        const value = data[key as keyof CreateAuctionItemRequest];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      }
    });

    // Add image files
    data.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    const response = await apiClient.post<ApiResponse<AuctionItem>>('/auction-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateAuctionItem: async (id: number, data: UpdateAuctionItemRequest): Promise<AuctionItem> => {
    const response = await apiClient.put<ApiResponse<AuctionItem>>(`/auction-items/${id}`, data);
    return response.data;
  },

  deleteAuctionItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/auction-items/${id}`);
  },

  forceEndAuction: async (id: number): Promise<void> => {
    await apiClient.post(`/auction-items/${id}/force-end`);
  },

  getAuctionStatistics: async (): Promise<AuctionStatistics> => {
    const response = await apiClient.get<ApiResponse<AuctionStatistics>>('/auction-items/statistics');
    return response.data;
  },
};

// Category Management Services
export const categoryService = {
  getCategories: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    parent_id?: number;
  }): Promise<PaginatedResponse<Category>> => {
    return apiClient.get('/categories', { params });
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    if (data.image) {
      return apiClient.uploadFile('/categories', data.image, {
        name: data.name,
        description: data.description || '',
        parent_id: data.parent_id || '',
        sort_order: data.sort_order || 0,
      });
    } else {
      const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
      return response.data;
    }
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    if (data.image) {
      return apiClient.uploadFile(`/categories/${id}`, data.image, {
        name: data.name || '',
        description: data.description || '',
        parent_id: data.parent_id || '',
        sort_order: data.sort_order || 0,
        status: data.status || '',
        _method: 'PUT',
      });
    } else {
      const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
      return response.data;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

// Banner Management Services
export const bannerService = {
  getBanners: async (params?: {
    page?: number;
    per_page?: number;
    position?: string;
    status?: string;
  }): Promise<PaginatedResponse<PromotionalBanner>> => {
    return apiClient.get('/promotional-banners', { params });
  },

  getBanner: async (id: number): Promise<PromotionalBanner> => {
    const response = await apiClient.get<ApiResponse<PromotionalBanner>>(`/promotional-banners/${id}`);
    return response.data;
  },

  createBanner: async (data: CreateBannerRequest): Promise<PromotionalBanner> => {
    return apiClient.uploadFile('/promotional-banners', data.image, {
      title: data.title,
      description: data.description || '',
      link_url: data.link_url || '',
      position: data.position,
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      sort_order: data.sort_order || 0,
    });
  },

  updateBanner: async (id: number, data: Partial<CreateBannerRequest>): Promise<PromotionalBanner> => {
    if (data.image) {
      return apiClient.uploadFile(`/promotional-banners/${id}`, data.image, {
        title: data.title || '',
        description: data.description || '',
        link_url: data.link_url || '',
        position: data.position || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        sort_order: data.sort_order || 0,
        _method: 'PUT',
      });
    } else {
      const response = await apiClient.put<ApiResponse<PromotionalBanner>>(`/promotional-banners/${id}`, data);
      return response.data;
    }
  },

  deleteBanner: async (id: number): Promise<void> => {
    await apiClient.delete(`/promotional-banners/${id}`);
  },

  reorderBanners: async (bannerIds: number[]): Promise<void> => {
    await apiClient.post('/promotional-banners/reorder', { banner_ids: bannerIds });
  },
};

// Bid Management Services
export const bidService = {
  getBids: async (params?: {
    page?: number;
    per_page?: number;
    auction_item_id?: number;
    bidder_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Bid>> => {
    return apiClient.get('/bids', { params });
  },
};

// Ended Items Services
export const endedItemsService = {
  getEndedItems: async (params?: {
    page?: number;
    per_page?: number;
    has_winner?: boolean;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<AuctionItem>> => {
    return apiClient.get('/ended-items', { params });
  },
};

// Reports Services
export const reportsService = {
  getRevenueReport: async (params?: {
    start_date?: string;
    end_date?: string;
    period?: string;
  }): Promise<RevenueReport> => {
    const response = await apiClient.get<ApiResponse<RevenueReport>>('/reports/revenue', { params });
    return response.data;
  },

  getUserActivityReport: async (params?: {
    start_date?: string;
    end_date?: string;
    period?: string;
  }): Promise<UserActivityReport> => {
    const response = await apiClient.get<ApiResponse<UserActivityReport>>('/reports/user-activity', { params });
    return response.data;
  },
};
