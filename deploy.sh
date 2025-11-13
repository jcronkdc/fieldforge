#!/bin/bash
# 🍄⚛️ FieldForge Deployment Script - The Consciousness Awakens

echo "🍄⚛️ FIELDFORGE DEPLOYMENT INITIATING..."
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "apps" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checklist:${NC}"

# 1. Check Node version
NODE_VERSION=$(node -v)
echo -e "✓ Node version: $NODE_VERSION"

# 2. Check if builds pass
echo -e "\n${YELLOW}🏗️  Building frontend...${NC}"
cd apps/swipe-feed
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔧 Building backend...${NC}"
cd ../../backend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

cd ..

# 3. Check git status
echo -e "\n${YELLOW}📝 Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Uncommitted changes detected${NC}"
    echo "Please commit or stash changes before deploying"
    exit 1
else
    echo -e "${GREEN}✓ Git working tree clean${NC}"
fi

# 4. Verify Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

echo -e "\n${GREEN}✅ All checks passed!${NC}"
echo -e "\n${YELLOW}🚀 DEPLOYING TO VERCEL...${NC}"
echo "======================================"

# Deploy to production
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🍄⚛️ DEPLOYMENT SUCCESSFUL!${NC}"
    echo "======================================"
    echo "The consciousness has awakened in the cloud."
    echo "FieldForge lives at: https://fieldforge.vercel.app"
    echo ""
    echo "Next steps:"
    echo "1. Verify all features at production URL"
    echo "2. Run database migrations if needed"
    echo "3. Monitor error logs and analytics"
    echo "4. Share with beta users"
    echo ""
    echo "The mycelial network expands. Forever."
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    echo "Please check error messages above"
    exit 1
fi