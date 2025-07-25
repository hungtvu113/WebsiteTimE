@echo off
setlocal enabledelayedexpansion

REM 🚀 Setup script cho GitHub Actions CI/CD Pipeline (Windows)
REM Script này sẽ hướng dẫn bạn setup các secrets và cấu hình cần thiết

echo 🚀 WebsiteTimE - GitHub Actions Setup
echo ======================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Không phải là git repository. Vui lòng chạy script trong thư mục dự án.
    pause
    exit /b 1
)

REM Check if GitHub CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  GitHub CLI chưa được cài đặt.
    echo Vui lòng cài đặt GitHub CLI để tự động setup secrets:
    echo https://cli.github.com/
    echo.
    echo Hoặc bạn có thể setup secrets thủ công qua GitHub web interface.
    set MANUAL_SETUP=true
) else (
    set MANUAL_SETUP=false
)

echo 📋 Kiểm tra cấu trúc dự án...

REM Check if required files exist
set "files=.github\workflows\ci-cd.yml .github\workflows\deploy-production.yml .github\workflows\dependency-update.yml .github\workflows\code-quality.yml backend\package.json frontend\package.json docker-compose.yml"

for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ Tìm thấy %%f
    ) else (
        echo ❌ Không tìm thấy %%f
        pause
        exit /b 1
    )
)

echo.
echo 📋 Chuẩn bị setup GitHub Secrets...
echo.
echo 📝 Danh sách secrets cần thiết:
echo ================================
echo • GEMINI_API_KEY - Google Gemini API Key
echo • DOCKER_USERNAME - Docker Hub Username
echo • DOCKER_PASSWORD - Docker Hub Password/Token
echo • SONAR_TOKEN - SonarCloud Token (optional)
echo • CODECOV_TOKEN - Codecov Token (optional)
echo • SLACK_WEBHOOK_URL - Slack Webhook URL (optional)
echo • PROD_API_URL - Production API URL
echo • PROD_APP_URL - Production App URL
echo.

if "%MANUAL_SETUP%"=="true" (
    echo ⚠️  Setup thủ công qua GitHub web interface:
    echo 1. Vào repository trên GitHub
    echo 2. Settings → Secrets and variables → Actions
    echo 3. Thêm các secrets ở trên
    echo.
    goto :create_env_files
)

set /p "setup_auto=Bạn có muốn setup secrets tự động? (y/n): "
if /i not "%setup_auto%"=="y" goto :create_env_files

echo 📋 Setup secrets với GitHub CLI...

REM Check if user is logged in to GitHub CLI
gh auth status >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Bạn chưa đăng nhập GitHub CLI.
    echo Chạy: gh auth login
    pause
    exit /b 1
)

echo.
echo 📋 Nhập các secrets cần thiết:
echo.

set /p "gemini_key=🔑 GEMINI_API_KEY: "
set /p "docker_username=🐳 DOCKER_USERNAME: "
set /p "docker_password=🐳 DOCKER_PASSWORD: "
set /p "prod_api_url=🌐 PROD_API_URL (e.g., https://api.yourdomain.com): "
set /p "prod_app_url=🌐 PROD_APP_URL (e.g., https://yourdomain.com): "

echo.
echo 📋 Đang setup secrets...

gh secret set GEMINI_API_KEY --body "%gemini_key%"
gh secret set DOCKER_USERNAME --body "%docker_username%"
gh secret set DOCKER_PASSWORD --body "%docker_password%"
gh secret set PROD_API_URL --body "%prod_api_url%"
gh secret set PROD_APP_URL --body "%prod_app_url%"

echo ✅ Đã setup các secrets cơ bản!

echo.
set /p "setup_optional=Bạn có muốn setup các secrets tùy chọn? (y/n): "
if /i "%setup_optional%"=="y" (
    set /p "sonar_token=📊 SONAR_TOKEN (optional, Enter để bỏ qua): "
    if not "!sonar_token!"=="" (
        gh secret set SONAR_TOKEN --body "!sonar_token!"
    )
    
    set /p "codecov_token=📈 CODECOV_TOKEN (optional, Enter để bỏ qua): "
    if not "!codecov_token!"=="" (
        gh secret set CODECOV_TOKEN --body "!codecov_token!"
    )
    
    set /p "slack_webhook=📢 SLACK_WEBHOOK_URL (optional, Enter để bỏ qua): "
    if not "!slack_webhook!"=="" (
        gh secret set SLACK_WEBHOOK_URL --body "!slack_webhook!"
    )
)

:create_env_files
echo.
echo 📋 Tạo file .env.example nếu chưa có...

REM Create .env.example for backend
if not exist "backend\.env.example" (
    (
        echo # Database
        echo MONGODB_URI=mongodb://localhost:27017/qltime
        echo.
        echo # Authentication
        echo JWT_SECRET=your_jwt_secret_here
        echo.
        echo # AI Integration
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # Server
        echo PORT=3001
        echo NODE_ENV=development
    ) > backend\.env.example
    echo ✅ Đã tạo backend\.env.example
)

REM Create .env.local.example for frontend
if not exist "frontend\.env.local.example" (
    (
        echo # API Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
        echo.
        echo # AI Integration
        echo NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
    ) > frontend\.env.local.example
    echo ✅ Đã tạo frontend\.env.local.example
)

echo.
echo 📋 Kiểm tra cấu hình Docker...

if exist "backend\Dockerfile" if exist "frontend\Dockerfile" (
    echo ✅ Docker files đã sẵn sàng
) else (
    echo ❌ Thiếu Docker files
)

echo.
echo ✅ 🎉 Setup hoàn tất!
echo.
echo 📋 Các bước tiếp theo:
echo 1. Commit và push các thay đổi lên GitHub
echo 2. Kiểm tra tab Actions để xem workflows
echo 3. Tạo Pull Request để test CI pipeline
echo 4. Tạo Release để test production deployment
echo.
echo 📚 Xem thêm hướng dẫn tại: .github\README.md
echo.
echo ⚠️  Lưu ý: Hãy đảm bảo các external services (SonarCloud, Codecov, Docker Hub) đã được setup đúng cách.
echo.
pause
