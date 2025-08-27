import { Product } from '@/types/product';

// Mock product data for testing
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    price: 299.99,
    currency: 'USD',
    colors: ['Black', 'White', 'Silver'],
    sizes: ['One Size'],
    image_urls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'
    ],
    source_url: 'https://example.com/headphones',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Stylish Summer Dress',
    description: 'A beautiful and comfortable summer dress perfect for any occasion.',
    price: 49.99,
    currency: 'USD',
    colors: ['Red', 'Blue', 'Green', 'Yellow'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image_urls: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'
    ],
    source_url: 'https://example.com/summer-dress',
    created_at: '2025-01-15T09:30:00Z',
    updated_at: '2025-01-15T09:30:00Z'
  },
  {
    id: '3',
    name: 'Gaming Mechanical Keyboard',
    description: 'Professional gaming keyboard with RGB lighting and mechanical switches.',
    price: 129.99,
    currency: 'USD',
    colors: ['Black', 'White'],
    sizes: ['Full Size', 'Compact'],
    image_urls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'
    ],
    source_url: 'https://example.com/gaming-keyboard',
    created_at: '2025-01-15T08:15:00Z',
    updated_at: '2025-01-15T08:15:00Z'
  }
];

// Mock user data
export const mockUser = {
  id: '1',
  username: 'admin',
  email: 'admin@zido.com'
};

// Mock authentication credentials
export const MOCK_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};
