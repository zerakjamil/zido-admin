const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { scrapeProduct } = require('./scrapers/productScraper');
const ImageDownloader = require('./scrapers/ImageDownloader');

const app = express();
const PORT = process.env.PORT || 3001;
const imageDownloader = new ImageDownloader();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve downloaded images statically
app.use('/api/images', express.static(imageDownloader.getDownloadDirectory()));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Product Scraper Service is running' });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    console.log(`Scraping product from: ${url}`);
    
    const productData = await scrapeProduct(url);
    
    // Download images if they exist
    if (productData.image_urls && productData.image_urls.length > 0) {
      try {
        console.log(`Downloading ${productData.image_urls.length} images...`);
        const productId = Date.now().toString(); // Simple product ID
        const localImagePaths = await imageDownloader.downloadProductImages(
          productData.image_urls, 
          productId
        );
        
        // Replace remote URLs with local server URLs
        if (localImagePaths.length > 0) {
          productData.image_urls = localImagePaths.map(path => 
            `http://localhost:${PORT}${path}`
          );
          console.log(`Successfully downloaded ${localImagePaths.length} images`);
        }
      } catch (downloadError) {
        console.warn('Image download failed, using original URLs:', downloadError.message);
      }
    }
    
    res.json({
      success: true,
      data: productData
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape product data'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Product Scraper Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
