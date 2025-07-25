#!/bin/bash

# 🚀 Setup script cho GitHub Actions CI/CD Pipeline
# Script này sẽ hướng dẫn bạn setup các secrets và cấu hình cần thiết

set -e

echo "🚀 WebsiteTimE - GitHub Actions Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Không phải là git repository. Vui lòng chạy script trong thư mục dự án."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI chưa được cài đặt."
    echo "Vui lòng cài đặt GitHub CLI để tự động setup secrets:"
    echo "https://cli.github.com/"
    echo ""
    echo "Hoặc bạn có thể setup secrets thủ công qua GitHub web interface."
    MANUAL_SETUP=true
else
    MANUAL_SETUP=false
fi

print_step "Kiểm tra cấu trúc dự án..."

# Check if required files exist
required_files=(
    ".github/workflows/ci-cd.yml"
    ".github/workflows/deploy-production.yml"
    ".github/workflows/dependency-update.yml"
    ".github/workflows/code-quality.yml"
    "backend/package.json"
    "frontend/package.json"
    "docker-compose.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Tìm thấy $file"
    else
        print_error "Không tìm thấy $file"
        exit 1
    fi
done

echo ""
print_step "Chuẩn bị setup GitHub Secrets..."

# List of required secrets
secrets=(
    "GEMINI_API_KEY:Google Gemini API Key"
    "DOCKER_USERNAME:Docker Hub Username"
    "DOCKER_PASSWORD:Docker Hub Password/Token"
    "SONAR_TOKEN:SonarCloud Token (optional)"
    "CODECOV_TOKEN:Codecov Token (optional)"
    "SLACK_WEBHOOK_URL:Slack Webhook URL (optional)"
    "PROD_API_URL:Production API URL"
    "PROD_APP_URL:Production App URL"
)

echo ""
echo "📝 Danh sách secrets cần thiết:"
echo "================================"

for secret in "${secrets[@]}"; do
    IFS=':' read -r key description <<< "$secret"
    echo "• $key - $description"
done

echo ""

if [ "$MANUAL_SETUP" = true ]; then
    print_warning "Setup thủ công qua GitHub web interface:"
    echo "1. Vào repository trên GitHub"
    echo "2. Settings → Secrets and variables → Actions"
    echo "3. Thêm các secrets ở trên"
    echo ""
else
    read -p "Bạn có muốn setup secrets tự động? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Setup secrets với GitHub CLI..."
        
        # Check if user is logged in to GitHub CLI
        if ! gh auth status &> /dev/null; then
            print_warning "Bạn chưa đăng nhập GitHub CLI."
            echo "Chạy: gh auth login"
            exit 1
        fi
        
        # Setup essential secrets
        echo ""
        print_step "Nhập các secrets cần thiết:"
        
        read -p "🔑 GEMINI_API_KEY: " -s gemini_key
        echo ""
        read -p "🐳 DOCKER_USERNAME: " docker_username
        read -p "🐳 DOCKER_PASSWORD: " -s docker_password
        echo ""
        read -p "🌐 PROD_API_URL (e.g., https://api.yourdomain.com): " prod_api_url
        read -p "🌐 PROD_APP_URL (e.g., https://yourdomain.com): " prod_app_url
        
        # Set secrets
        echo ""
        print_step "Đang setup secrets..."
        
        gh secret set GEMINI_API_KEY --body "$gemini_key"
        gh secret set DOCKER_USERNAME --body "$docker_username"
        gh secret set DOCKER_PASSWORD --body "$docker_password"
        gh secret set PROD_API_URL --body "$prod_api_url"
        gh secret set PROD_APP_URL --body "$prod_app_url"
        
        print_success "Đã setup các secrets cơ bản!"
        
        echo ""
        read -p "Bạn có muốn setup các secrets tùy chọn? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "📊 SONAR_TOKEN (optional, Enter để bỏ qua): " sonar_token
            if [ ! -z "$sonar_token" ]; then
                gh secret set SONAR_TOKEN --body "$sonar_token"
            fi
            
            read -p "📈 CODECOV_TOKEN (optional, Enter để bỏ qua): " codecov_token
            if [ ! -z "$codecov_token" ]; then
                gh secret set CODECOV_TOKEN --body "$codecov_token"
            fi
            
            read -p "📢 SLACK_WEBHOOK_URL (optional, Enter để bỏ qua): " slack_webhook
            if [ ! -z "$slack_webhook" ]; then
                gh secret set SLACK_WEBHOOK_URL --body "$slack_webhook"
            fi
        fi
    fi
fi

echo ""
print_step "Tạo environments..."

if [ "$MANUAL_SETUP" = false ]; then
    # Create environments
    gh api repos/:owner/:repo/environments/staging --method PUT --field prevent_self_review=false || true
    gh api repos/:owner/:repo/environments/production --method PUT --field prevent_self_review=true || true
    print_success "Đã tạo staging và production environments"
fi

echo ""
print_step "Kiểm tra cấu hình Docker..."

# Check Docker files
if [ -f "backend/Dockerfile" ] && [ -f "frontend/Dockerfile" ]; then
    print_success "Docker files đã sẵn sàng"
else
    print_error "Thiếu Docker files"
fi

echo ""
print_step "Tạo file .env.example nếu chưa có..."

# Create .env.example for backend
if [ ! -f "backend/.env.example" ]; then
    cat > backend/.env.example << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/qltime

# Authentication
JWT_SECRET=your_jwt_secret_here

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=3001
NODE_ENV=development
EOF
    print_success "Đã tạo backend/.env.example"
fi

# Create .env.local.example for frontend
if [ ! -f "frontend/.env.local.example" ]; then
    cat > frontend/.env.local.example << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# AI Integration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EOF
    print_success "Đã tạo frontend/.env.local.example"
fi

echo ""
print_step "Tạo file .gitignore cho GitHub Actions artifacts..."

if ! grep -q "# GitHub Actions" .gitignore 2>/dev/null; then
    cat >> .gitignore << EOF

# GitHub Actions
.github/workflows/*.log
performance-report.json
complexity-report.json
security-audit.json
outdated-packages.txt
doc-report.md
EOF
    print_success "Đã cập nhật .gitignore"
fi

echo ""
print_success "🎉 Setup hoàn tất!"
echo ""
echo "📋 Các bước tiếp theo:"
echo "1. Commit và push các thay đổi lên GitHub"
echo "2. Kiểm tra tab Actions để xem workflows"
echo "3. Tạo Pull Request để test CI pipeline"
echo "4. Tạo Release để test production deployment"
echo ""
echo "📚 Xem thêm hướng dẫn tại: .github/README.md"
echo ""
print_warning "Lưu ý: Hãy đảm bảo các external services (SonarCloud, Codecov, Docker Hub) đã được setup đúng cách."
