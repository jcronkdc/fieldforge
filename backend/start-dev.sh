#!/bin/bash
# Development Quick Start Script for FieldForge Backend

echo "🚀 Starting FieldForge Backend in Development Mode..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file with development defaults..."
    cat > .env << EOL
# Auto-generated development environment
# Update with your actual values

# Database Configuration (optional in dev mode)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldforge_dev

# Supabase Configuration (from frontend .env)
SUPABASE_URL=https://lzfzkrylexsarpxypktt.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY_HERE

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOL
    echo "✅ Created .env file"
    echo "⚠️  Note: Add SUPABASE_SERVICE_KEY from your Supabase dashboard for full authentication"
    echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🎯 Starting server on http://localhost:4000"
echo "Press Ctrl+C to stop"
echo ""
npm run dev
