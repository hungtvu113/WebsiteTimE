#!/bin/bash

# 🔧 Fix Lint Issues Script
echo "🔧 Fixing lint issues in WebsiteTimE project..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

print_status "Starting lint fixes..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    pnpm install
fi

# Fix backend lint issues
print_status "Fixing backend lint issues..."
if pnpm backend:lint:fix; then
    print_status "Backend lint fixes applied successfully"
else
    print_warning "Some backend lint issues may require manual fixing"
fi

# Fix frontend lint issues
print_status "Fixing frontend lint issues..."
if pnpm frontend:lint:fix; then
    print_status "Frontend lint fixes applied successfully"
else
    print_warning "Some frontend lint issues may require manual fixing"
fi

# Run lint check to see remaining issues
print_status "Checking remaining lint issues..."

echo ""
echo "📊 Backend lint status:"
if pnpm backend:lint; then
    print_status "Backend: No lint issues remaining"
else
    print_warning "Backend: Some lint issues remain (check output above)"
fi

echo ""
echo "📊 Frontend lint status:"
if pnpm frontend:lint; then
    print_status "Frontend: No lint issues remaining"
else
    print_warning "Frontend: Some lint issues remain (check output above)"
fi

echo ""
print_status "Lint fix process completed!"
echo ""
echo "📝 Next steps:"
echo "1. Review any remaining lint warnings above"
echo "2. Commit the fixed files: git add . && git commit -m '🔧 Fix lint issues'"
echo "3. Push changes: git push"
echo ""
echo "🚀 Your CI/CD pipeline should now pass the lint checks!"
