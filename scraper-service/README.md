# Product Scraper Service

A Node.js microservice for scraping product data from e-commerce websites.

## Features

- Extract product information from various e-commerce platforms
- Support for multiple data formats and website structures
- Fallback to mock data when scraping fails
- RESTful API interface
- CORS enabled for frontend integration

## Installation

```bash
cd scraper-service
npm install
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The service will run on port 3001 by default.

## API Endpoints

### Health Check
```
GET /health
```

Returns the service status.

### Scrape Product
```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com/product"
}
```

Returns scraped product data:
```json
{
  "success": true,
  "data": {
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "currency": "USD",
    "colors": ["Red", "Blue"],
    "sizes": ["S", "M", "L"],
    "image_urls": ["https://example.com/image.jpg"]
  }
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## Dependencies

- Express.js: Web framework
- Puppeteer: Web scraping
- Cheerio: HTML parsing
- CORS: Cross-origin resource sharing
- Helmet: Security headers
