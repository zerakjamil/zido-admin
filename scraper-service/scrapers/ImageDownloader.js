const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Download and save images locally
 */
class ImageDownloader {
  constructor() {
    this.downloadDir = path.join(__dirname, '..', 'downloads', 'images');
    this.ensureDownloadDirectory();
  }

  /**
   * Ensure the download directory exists
   */
  ensureDownloadDirectory() {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  /**
   * Guess a file extension from a response content-type
   */
  static extFromContentType(contentType) {
    if (!contentType) return null;
    if (contentType.includes('image/jpeg')) return '.jpg';
    if (contentType.includes('image/png')) return '.png';
    if (contentType.includes('image/webp')) return '.webp';
    if (contentType.includes('image/avif')) return '.avif';
    if (contentType.includes('image/gif')) return '.gif';
    return null;
  }

  /**
   * Normalize and clean image URL (preserve query for Shein CDNs)
   */
  static normalizeUrl(imageUrl) {
    try {
      if (imageUrl.startsWith('//')) return 'https:' + imageUrl;
      const u = new URL(imageUrl);
      const host = u.hostname.toLowerCase();
      const isSheinCdn = /ltwebstatic|shein|sheinsz|sheincdn/i.test(host);
      // Keep query for Shein CDNs (may contain sizing/signature). Otherwise, drop it.
      return isSheinCdn ? u.toString() : (u.origin + u.pathname);
    } catch {
      return imageUrl;
    }
  }

  /**
   * Build a list of candidate URLs to try for a given image URL
   */
  static buildCandidates(rawUrl) {
    let url = ImageDownloader.normalizeUrl(rawUrl);
    const candidates = new Set();

    const push = (u) => { try { if (u) candidates.add(u); } catch {} };
    push(url);

    try {
      const u = new URL(url);
      const hasQuery = !!u.search;
      const withoutQuery = u.origin + u.pathname;

      // Size upgrades commonly used by Shein CDN
      const upgradeSize = (p, size) => {
        if (p.includes('_200x')) return p.replace('_200x', `_${size}`);
        if (p.includes('_300x')) return p.replace('_300x', `_${size}`);
        if (p.includes('_400x')) return p.replace('_400x', `_${size}`);
        if (!p.match(/_(750x|1000x)\./)) {
          const parts = p.split('.');
          if (parts.length > 1) {
            const e = parts.pop();
            return parts.join('.') + `_${size}.` + e;
          }
        }
        return p;
      };

      // Try higher resolutions first
      push(u.origin + upgradeSize(u.pathname, '1000x') + u.search);
      push(u.origin + upgradeSize(u.pathname, '750x') + u.search);

      // Also try without query (if originally had one)
      if (hasQuery) {
        push(withoutQuery);
        push(upgradeSize(withoutQuery, '1000x'));
        push(upgradeSize(withoutQuery, '750x'));
      }

      // Ensure protocol is https
      if (u.protocol === 'http:') {
        const httpsUrl = 'https://' + u.host + u.pathname + (u.search || '');
        push(httpsUrl);
      }
    } catch {}

    return Array.from(candidates);
  }

  /**
   * Download an image from a URL
   * @param {string} imageUrl - The image URL to download
   * @param {string} productId - Product ID for organizing files
   * @param {number} index - Image index
   * @param {object} [opts]
   * @param {string} [opts.referer] - Referer header to send (e.g., the product page URL)
   * @returns {Promise<string>} Local file path
   */
  async downloadImage(imageUrl, productId, index, opts = {}) {
    const refererHeader = opts.referer || 'https://us.shein.com/';

    const candidates = ImageDownloader.buildCandidates(imageUrl);

    return new Promise((resolve, reject) => {
      const tryNext = (i, redirectsLeft = 5) => {
        if (i >= candidates.length) {
          return reject(new Error('Exhausted candidates'));
        }

        let urlToGet = candidates[i];
        let urlObj;
        try {
          urlObj = new URL(urlToGet);
        } catch (e) {
          return tryNext(i + 1);
        }

        const initialExt = path.extname(urlObj.pathname);
        const baseFilename = `${productId}_${index}`;
        const tempFilePath = path.join(this.downloadDir, baseFilename + (initialExt || '.img'));

        // Skip if file already exists with any common extension
        const existing = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']
          .map(ext => path.join(this.downloadDir, baseFilename + ext))
          .find(p => fs.existsSync(p));
        if (existing) {
          return resolve(`/api/images/${path.basename(existing)}`);
        }

        const protocol = urlObj.protocol === 'https:' ? https : http;
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname + (urlObj.search || ''),
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            // Many CDNs (incl. Shein) validate referer
            'Referer': refererHeader,
          }
        };

        const req = protocol.request(options, (res) => {
          // Handle redirects
          if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            if (redirectsLeft <= 0) {
              res.resume();
              return tryNext(i + 1);
            }
            const location = res.headers.location.startsWith('http')
              ? res.headers.location
              : `${urlObj.protocol}//${urlObj.host}${res.headers.location}`;
            res.resume();
            candidates.splice(i + 1, 0, location); // try redirected URL next
            return tryNext(i + 1, redirectsLeft - 1);
          }

          if (res.statusCode !== 200) {
            res.resume();
            // Try next candidate on 4xx/5xx
            return tryNext(i + 1);
          }

          const contentType = res.headers['content-type'] || '';
          if (!contentType.startsWith('image/')) {
            res.resume();
            return tryNext(i + 1);
          }

          // Determine extension
          let finalExt = initialExt || ImageDownloader.extFromContentType(contentType) || '.jpg';
          // Normalize jpeg extension
          if (finalExt === '.jpeg') finalExt = '.jpg';
          const finalFilePath = path.join(this.downloadDir, baseFilename + finalExt);

          const fileStream = fs.createWriteStream(finalFilePath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close(() => resolve(`/api/images/${path.basename(finalFilePath)}`));
          });
          fileStream.on('error', () => {
            try { fs.unlinkSync(finalFilePath); } catch {}
            return tryNext(i + 1);
          });
        });

        req.on('error', () => {
          try { fs.unlinkSync(tempFilePath); } catch {}
          return tryNext(i + 1);
        });

        req.setTimeout(20000, () => {
          req.destroy(new Error('Download timeout'));
        });

        req.end();
      };

      try {
        tryNext(0);
      } catch {
        reject(new Error('Failed to start download'));
      }
    });
  }

  /**
   * Download multiple images for a product
   * @param {string[]} imageUrls - Array of image URLs
   * @param {string} productId - Product ID
   * @param {object} [opts] - Options (e.g., referer)
   * @returns {Promise<string[]>} Array of local image paths
   */
  async downloadProductImages(imageUrls, productId, opts = {}) {
    const downloadPromises = imageUrls.map((url, index) => 
      this.downloadImage(url, productId, index, opts).catch(error => {
        console.error(`Failed to download image ${index} for product ${productId}:`, error.message);
        return null;
      })
    );

    const results = await Promise.all(downloadPromises);
    return results.filter(path => path !== null);
  }

  /**
   * Get the downloads directory path
   */
  getDownloadDirectory() {
    return this.downloadDir;
  }
}

module.exports = ImageDownloader;
