#!/bin/bash

# Chore Champ - Local Development Setup Script
# This script sets up the local development environment

echo "🚀 Chore Champ - Local Development Setup"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env with your settings:"
    echo "   - DATABASE_URL (optional - defaults to IndexedDB)"
    echo "   - CLOUDFLARE_ACCESS_URL (optional for local dev)"
    echo "   - CLOUDFLARE_ACCESS_CLIENT_ID (optional for local dev)"
    echo "   - CLOUDFLARE_ACCESS_CLIENT_SECRET (optional for local dev)"
    echo "   - GEMINI_API_KEY (optional)"
else
    echo "✅ .env file already exists"
fi

echo ""

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
dev-dist/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Local database
local-chore-champ.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Edit .env with your settings (optional)"
echo "   2. Start the development server:"
echo "      npm run dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see:"
echo "   - docs/LOCAL-DEPLOYMENT.md"
echo "   - README.md"
echo ""
