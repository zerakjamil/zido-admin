# E-commerce Product Scraper & Importer - Demo Guide

## Overview

This application demonstrates an E-commerce Product Scraper & Importer MVP that can extract product details from e-commerce URLs, allowing administrators to review and save product data.

## 🚀 Quick Start

### 1. Start the Application
```bash
cd /home/aywar/zido-admin
npm run dev:all
```

### 2. Access the Application
- **Frontend**: http://localhost:3002
- **Scraper API**: http://localhost:3001

### 3. Login Credentials
- **Username**: `admin`
- **Password**: `password123`

## 📱 Demo with Real Shein Product

### Example Product URL
Use this Shein product URL for testing:
```
https://us.shein.com/Avantive-Metal-Trim-Halter-Neck-And-Off-The-Shoulder-Black-Top-Formal-Back-To-School-Halloween-Wedding-Guest-Vacation-Y2k-Beach-Cute-Teacher-Going-Out-Business-Casual-Elegant-Birthday-Office-Outfits-Country-Concert-Club-Western-Work-Clothes-Streetwear-Vintage-Festival-Cocktail-Rave-Prom-Airport-Funny-Basic-Brunch-Outfits-2000s-Style-Bodycon-Old-Money-Style-Church-Homecoming-Classy-Party-Modest-Fairycore-Coquette-Date-Night-Festival-Resort-Wear-Baddie-Stockholm-Style-Night-Out-p-86164532.html
```

### Expected Product Data
When you paste the above URL, the application will extract (or simulate extracting) the following data:

- **Product Name**: Avantive Metal Trim/Halter Neck And Off-The-Shoulder/Black Top
- **Price**: $5.75 USD
- **Description**: Stylish halter neck top with metal trim detailing and off-the-shoulder design. Perfect for formal occasions, parties, or special events.
- **Colors**: Black, Yellow, Pink, Khaki, Navy
- **Sizes**: XS, S, M, L, XL, 2XL
- **Images**: Multiple product images

## 🎯 Application Features

### 1. Authentication System
- Mock login system with session management
- Persistent login state across page refreshes
- Secure logout functionality

### 2. Product Import Workflow
1. **Navigate to Import Page**: Click "Import Product" in the navigation
2. **Enter Product URL**: Paste the Shein URL (or any e-commerce URL)
3. **Extract Data**: Click "Extract Data" to scrape product information
4. **Review & Edit**: Modify the extracted data as needed
5. **Save Product**: Add the product to your inventory

### 3. Product Dashboard
- View all imported products in a clean table format
- Sort and filter products
- Delete products from inventory
- View product details and images

### 4. Smart Data Extraction
- **Shein-Optimized**: Special handling for Shein product pages
- **Fallback System**: Mock data when scraper service is unavailable
- **Image Support**: External image hosting configured
- **Multi-Platform**: Extensible to support other e-commerce sites

## 🏗️ Technical Architecture

### Frontend (Next.js)
- **React Context**: Authentication and product state management
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern, responsive UI
- **Service Layer**: Isolated API calls for easy Laravel integration

### Scraper Service (Node.js)
- **Express.js**: RESTful API endpoints
- **Puppeteer**: Advanced web scraping capabilities
- **Cheerio**: HTML parsing and data extraction
- **CORS**: Cross-origin request handling

### Mock Data Layer
- **Local Storage**: Persistent product storage
- **Session Management**: User authentication state
- **Fallback System**: Graceful degradation when services are unavailable

## 🧪 Testing the Application

### Test Scenario 1: Product Import
1. Login with admin credentials
2. Navigate to "Import Product"
3. Paste the Shein URL provided above
4. Click "Extract Data"
5. Verify the extracted product information
6. Modify any fields if needed
7. Click "Save Product"
8. Navigate to "Products" to see the saved item

### Test Scenario 2: Product Management
1. Go to the Products dashboard
2. View the list of all saved products
3. Click "Delete" on any product to remove it
4. Notice the real-time updates to the product count

### Test Scenario 3: Session Management
1. Navigate through different pages while logged in
2. Refresh the browser - you should remain logged in
3. Click "Logout" to end the session
4. Try accessing protected pages - you'll be redirected to login

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:3001
```

### Image Domains
External images are configured in `next.config.ts`:
```typescript
images: {
  domains: ['images.unsplash.com'],
}
```

## 🚀 Future Laravel Integration

The application is structured for easy Laravel integration:

### Ready for Laravel
- **Service Layer**: All API calls are isolated in `/src/services/`
- **Type Definitions**: Complete TypeScript interfaces in `/src/types/`
- **Mock Data**: Structured to match future database schema

### Migration Steps
1. Replace mock authentication with Laravel API calls
2. Update `/src/services/` to call Laravel endpoints
3. Remove localStorage usage in favor of database operations
4. Configure CORS for Laravel backend

## 📊 Database Schema (Future)

The mock data structure matches this planned database schema:

```sql
-- Products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    colors JSON,
    sizes JSON,
    image_urls JSON,
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔍 Troubleshooting

### Common Issues

1. **Image not loading**: Check if the domain is added to `next.config.ts`
2. **Scraper service not working**: The app will fall back to mock data
3. **Port conflicts**: Next.js will automatically use an available port
4. **Login not working**: Ensure you're using the correct demo credentials

### Debug Commands
```bash
# Check running services
lsof -i :3000,3001,3002

# Restart services
npm run dev:restart

# Check logs
npm run logs
```

## 📝 Next Steps

1. **Enhanced Scraping**: Add support for more e-commerce platforms
2. **Laravel Backend**: Implement full backend with database
3. **User Management**: Multi-user system with roles and permissions
4. **Product Categories**: Organize products by categories and tags
5. **Bulk Import**: CSV/Excel import functionality
6. **Analytics**: Product performance tracking and insights

---

**Demo Ready!** 🎉 Your E-commerce Product Scraper & Importer MVP is now ready for demonstration. Use the Shein URL provided above to showcase the complete product import workflow.
