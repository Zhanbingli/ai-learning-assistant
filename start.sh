#!/bin/bash

# AI Learning Assistant - Quick Start Script

set -e

echo "🚀 AI Learning Assistant - Quick Start"
echo "======================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18"
    echo "   Download: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your AI API keys"
    echo ""
    read -p "Press Enter to open .env file..."
    ${EDITOR:-nano} .env
fi

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Initialize database
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Initializing database..."
    npx prisma migrate dev --name init
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start development: npm run dev"
echo "   2. Open frontend: http://localhost:5173"
echo "   3. API endpoint: http://localhost:3001"
echo ""
echo "📚 Documentation:"
echo "   - Setup guide: SETUP.md"
echo "   - Features: README.md"
echo ""
echo "Starting development servers in 3 seconds..."
sleep 3

npm run dev
