import { ScrapeRequest, ScrapeResponse, ScrapedProductData } from '@/types/product';

const SCRAPER_API_URL = process.env.NEXT_PUBLIC_SCRAPER_API_URL || 'http://localhost:3001';

export class ScrapingService {
  static async scrapeProduct(url: string): Promise<ScrapedProductData> {
    try {
      const request: ScrapeRequest = { url };
      
      const response = await fetch(`${SCRAPER_API_URL}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ScrapeResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to scrape product data');
      }

      return result.data;
    } catch (error) {
      console.error('Error scraping product:', error);
      
      // For MVP, return mock data if scraper service is not available
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Scraper service not available, returning mock data');
        return this.getMockScrapedData();
      }
      
      throw error;
    }
  }

  // Mock scraped data for when the scraper service is not available
  private static getMockScrapedData(): ScrapedProductData {
    // Return the specific Shein product data for demo
    return {
      name: 'Avantive Metal Trim/Halter Neck And Off-The-Shoulder/Black Top',
      description: 'Stylish halter neck top with metal trim detailing and off-the-shoulder design. Perfect for formal occasions, parties, or special events. Features an elegant black color that complements any outfit. Made with comfortable materials suitable for various body types.',
      price: 5.75,
      currency: 'USD',
      colors: ['Black', 'Yellow', 'Pink', 'Khaki', 'Navy'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image_urls: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
        'https://images.unsplash.com/photo-1544957992-20349e4d0d8f?w=400'
      ]
    };
  }
}
