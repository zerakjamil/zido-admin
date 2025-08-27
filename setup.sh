#!/bin/bash

echo "🚀 Setting up E-commerce Product Scraper & Importer MVP"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install main dependencies
echo "📦 Installing Next.js dependencies..."
npm install

# Install scraper service dependencies
echo "📦 Installing scraper service dependencies..."
cd scraper-service
npm install
cd ..

# Copy environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "✅ Environment file created (.env.local)"
else
    echo "ℹ️  Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev:all    # Start both Next.js and scraper service"
echo ""
echo "Or start services individually:"
echo "  npm run dev        # Next.js app (http://localhost:3000)"
echo "  npm run scraper:dev # Scraper service (http://localhost:3001)"
echo ""
echo "Demo login credentials:"
echo "  Username: admin"
echo "  Password: password123"
echo ""
echo "Happy scraping! 🕷️"
