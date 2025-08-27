const express = require('express');
const https = require('https');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());

// Image proxy endpoint
app.get('/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const url = new URL(imageUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Access-Control-Allow-Origin': '*'
    });

    const request = protocol.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Set the correct content type from the response
      if (response.headers['content-type']) {
        res.set('Content-Type', response.headers['content-type']);
      }
      
      // Pipe the image data to the response
      response.pipe(res);
    });

    request.on('error', (error) => {
      console.error('Image proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    });

    request.setTimeout(10000, () => {
      request.abort();
      res.status(408).json({ error: 'Request timeout' });
    });

  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
  }
});

app.listen(PORT, () => {
  console.log(`Image proxy server running on http://localhost:${PORT}`);
  console.log(`Usage: http://localhost:${PORT}/proxy-image?url=IMAGE_URL`);
});

module.exports = app;
