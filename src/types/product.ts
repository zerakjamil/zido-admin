export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  colors: string[];
  sizes: string[];
  image_urls: string[];
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  colors: string[];
  sizes: string[];
  image_urls: string[];
  source_url: string;
}

export interface ScrapedProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  colors: string[];
  sizes: string[];
  image_urls: string[];
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
}
