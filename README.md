# E-commerce Product Scraper & Importer MVP

A secure, internal web application that allows administrators to scrape product details from e-commerce URLs, review the extracted data, and save it to a local database.

## 🚀 Features

### ✅ Implemented (MVP)
- **Mock Authentication System**: Secure login with demo credentials
- **Product Scraping Service**: Functional Node.js service using Puppeteer
- **Product Import Interface**: Clean UI to paste URLs and extract data
- **Product Management**: View, edit, and delete saved products
- **Dashboard**: Overview of product statistics and recent imports
- **Responsive Design**: Modern UI built with Tailwind CSS

### 🔄 Future Enhancements
- Laravel backend integration
- Real user management system
- Advanced product categorization
- Bulk import functionality
- Export capabilities

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Scraping Service**: Node.js with Express, Puppeteer, and Cheerio
- **Data Storage**: Local storage (mock data for MVP)
- **Future Backend**: Laravel API (to be integrated)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone and install dependencies
npm run setup

# Copy environment variables
cp .env.example .env.local
```

## 🚀 Running the Application

### Development Mode (Recommended)
```bash
# Start both Next.js app and scraper service
npm run dev:all
```

This will start:
- Next.js app on http://localhost:3000
- Scraper service on http://localhost:3001

### Individual Services
```bash
# Next.js app only
npm run dev

# Scraper service only
npm run scraper:dev
```

## 📚 Usage

### 1. Login
- Navigate to http://localhost:3000
- Use demo credentials:
  - **Username**: `admin`
  - **Password**: `password123`

### 2. Import Products
- Go to "Import Product" page
- Paste any e-commerce URL (the scraper will return mock data for testing)
- Review and edit the extracted data
- Save the product

### 3. Manage Products
- View all products in the "Products" page
- Delete products as needed
- Check dashboard for statistics

## 🛠️ Technical Details

### Project Structure
```
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Products)
│   ├── lib/                # Utilities and mock data
│   ├── services/           # API service layer
│   └── types/              # TypeScript type definitions
├── scraper-service/        # Node.js scraping microservice
│   ├── scrapers/           # Scraping logic
│   └── server.js           # Express server
```

### Data Models
```typescript
interface Product {
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
```

### API Endpoints

#### Scraper Service
- `POST /api/scrape` - Extract product data from URL
- `GET /health` - Service health check

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:3001
```

### Mock Data
The application includes realistic mock data for:
- User authentication
- Product catalog
- Scraped product responses

## 🌐 Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📝 Future Integration

### Laravel Backend Migration
The codebase is structured to easily integrate with a Laravel backend:

1. **Service Layer**: All data operations are isolated in `/src/services/`
2. **Mock Data**: Can be replaced with real API calls
3. **Type Definitions**: Ready for API integration

### Planned Laravel Endpoints
- `POST /api/auth/login` - Real authentication
- `GET /api/products` - Fetch products
- `POST /api/products` - Create product
- `DELETE /api/products/{id}` - Delete product

## 🚨 Important Notes

- This is an MVP using mock data
- The scraper service works with real URLs but may return mock data for testing
- All product data is stored in browser localStorage
- Authentication is mocked (always succeeds with demo credentials)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
