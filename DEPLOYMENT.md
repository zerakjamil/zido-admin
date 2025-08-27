# Deployment Guide

## Development Deployment

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start
```bash
# 1. Setup the project
./setup.sh

# 2. Start development servers
npm run dev:all
```

Visit:
- Frontend: http://localhost:3000
- Scraper API: http://localhost:3001

## Production Deployment

### Building for Production
```bash
# Build Next.js app
npm run build

# Start production servers
npm start &
npm run scraper:start &
```

### Docker Deployment (Future)
```dockerfile
# Dockerfile example for future containerization
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000 3001
CMD ["npm", "run", "start:prod"]
```

### Environment Variables

#### Production Environment Variables
```bash
# .env.production
NEXT_PUBLIC_SCRAPER_API_URL=https://your-scraper-api.com
NODE_ENV=production
```

#### Scraper Service Environment Variables
```bash
# scraper-service/.env
PORT=3001
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

## Server Configuration

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Scraper API
    location /api/scrape {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### PM2 Configuration
```json
{
  "apps": [
    {
      "name": "zido-admin-frontend",
      "script": "npm",
      "args": "start",
      "cwd": "/path/to/zido-admin",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3000"
      }
    },
    {
      "name": "zido-admin-scraper",
      "script": "npm",
      "args": "start",
      "cwd": "/path/to/zido-admin/scraper-service",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3001"
      }
    }
  ]
}
```

## Security Considerations

### For Production
1. **Environment Variables**: Never commit sensitive data
2. **API Rate Limiting**: Implement rate limiting for scraper endpoint
3. **CORS Configuration**: Restrict origins in production
4. **Authentication**: Replace mock auth with real authentication
5. **HTTPS**: Use SSL certificates for all communications
6. **Input Validation**: Validate all URLs before scraping
7. **Error Handling**: Don't expose stack traces in production

### Recommended Security Headers
```javascript
// helmet configuration for scraper service
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Monitoring and Logging

### Application Monitoring
- Use application monitoring tools (e.g., Sentry, LogRocket)
- Set up health checks for both services
- Monitor scraping success rates
- Track API response times

### Log Management
```javascript
// Example logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

### Next.js Optimizations
- Enable image optimization
- Use static generation where possible
- Implement proper caching strategies
- Bundle size optimization

### Scraper Service Optimizations
- Implement connection pooling for Puppeteer
- Add request queuing for high load
- Use caching for frequently scraped sites
- Implement timeout configurations

## Troubleshooting

### Common Issues
1. **Puppeteer Issues**: Install required dependencies for headless Chrome
2. **CORS Errors**: Check API URL configuration
3. **Memory Issues**: Configure Puppeteer memory limits
4. **Network Timeouts**: Adjust timeout configurations

### Debug Commands
```bash
# Check service health
curl http://localhost:3001/health

# Check application logs
npm run logs

# Test scraper endpoint
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/product"}'
```
