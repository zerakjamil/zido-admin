const express = require('express');
const https = require('https');
const path = require('path');

const router = express.Router();

// Image proxy endpoint
router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Make request to the original image URL
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://us.shein.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(res);
      } else {
        res.status(404).send('Image not found');
      }
    });

    request.on('error', (error) => {
      console.error('Error fetching image:', error);
      res.status(500).send('Error fetching image');
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

module.exports = router;
