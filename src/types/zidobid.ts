export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  phone: string | null;
  profile_image: string | null;
  status: 'active' | 'suspended' | 'banned';
  suspension_reason: string | null;
  suspension_until: string | null;
  total_auctions: number;
  total_bids: number;
  total_winnings: number;
  registration_date: string;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  parent_id: number | null;
  status: 'active' | 'inactive';
  sort_order: number;
  auction_items_count: number;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export interface AuctionItem {
  id: number;
  title: string;
  description: string;
  starting_bid: number;
  current_bid: number;
  reserve_price: number | null;
  bid_increment: number;
  start_time: string;
  end_time: string;
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  featured: boolean;
  condition: string;
  location: string;
  shipping_info: string | null;
  images: string[];
  category_id: number;
  category: Category;
  seller_id: number;
  seller: User;
  bids_count: number;
  watchers_count: number;
  views_count: number;
  winner_id: number | null;
  winner: User | null;
  final_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromotionalBanner {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link_url: string | null;
  position: 'header' | 'sidebar' | 'footer' | 'home_hero' | 'category_top';
  status: 'active' | 'inactive';
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: number;
  amount: number;
  bid_time: string;
  bidder_id: number;
  bidder: User;
  auction_item_id: number;
  auction_item: AuctionItem;
  is_winning: boolean;
  auto_bid_max: number | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_auction_items: number;
  active_auctions: number;
  total_bids: number;
  total_revenue: number;
  recent_signups: number;
  recent_auctions: number;
  pending_items: number;
  reported_items: number;
  user_growth: {
    period: string;
    count: number;
  }[];
  revenue_growth: {
    period: string;
    amount: number;
  }[];
  popular_categories: {
    name: string;
    count: number;
  }[];
  top_sellers: {
    name: string;
    total_sales: number;
    total_revenue: number;
  }[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: Admin;
  token: string;
  expires_at: string;
}

export interface CreateAuctionItemRequest {
  title: string;
  description: string;
  starting_bid: number;
  reserve_price?: number;
  bid_increment: number;
  start_time: string;
  end_time: string;
  category_id: number;
  condition: string;
  location: string;
  shipping_info?: string;
  images: File[];
  featured?: boolean;
}

export interface UpdateAuctionItemRequest {
  title?: string;
  description?: string;
  starting_bid?: number;
  reserve_price?: number;
  bid_increment?: number;
  start_time?: string;
  end_time?: string;
  category_id?: number;
  condition?: string;
  location?: string;
  shipping_info?: string;
  featured?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parent_id?: number;
  image?: File;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parent_id?: number;
  image?: File;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface CreateBannerRequest {
  title: string;
  description?: string;
  image: File;
  link_url?: string;
  position: 'header' | 'sidebar' | 'footer' | 'home_hero' | 'category_top';
  start_date?: string;
  end_date?: string;
  sort_order?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'suspended' | 'banned';
}

export interface SuspendUserRequest {
  reason: string;
  duration?: number; // in days
  until?: string; // specific date
}

export interface RevenueReport {
  total_revenue: number;
  period_revenue: number;
  commission_revenue: number;
  listing_fees: number;
  premium_fees: number;
  daily_breakdown: {
    date: string;
    revenue: number;
    transactions: number;
  }[];
  top_revenue_categories: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
}

export interface UserActivityReport {
  total_active_users: number;
  new_registrations: number;
  active_bidders: number;
  active_sellers: number;
  daily_activity: {
    date: string;
    active_users: number;
    new_registrations: number;
    total_bids: number;
    total_listings: number;
  }[];
  user_engagement: {
    metric: string;
    value: number;
    change: number;
  }[];
}

export interface AuctionStatistics {
  total_auctions: number;
  active_auctions: number;
  ended_auctions: number;
  draft_auctions: number;
  cancelled_auctions: number;
  total_bids: number;
  total_revenue: number;
  average_auction_value: number;
  highest_auction_value: number;
  most_popular_category: string;
  auction_completion_rate: number;
}
