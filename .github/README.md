# 🚀 GitHub Actions CI/CD Pipeline

Dự án WebsiteTimE sử dụng GitHub Actions để tự động hóa quá trình CI/CD với các workflow sau:

## 📋 Danh sách Workflows

### 1. 🔄 CI/CD Pipeline (`ci-cd.yml`)
**Trigger:** Push/PR vào `main` và `develop`

**Các bước:**
- 🔍 **Lint & Code Quality**: Kiểm tra code style và quality
- 🧪 **Test Backend**: Chạy unit tests với MongoDB
- 🏗️ **Build Frontend**: Build ứng dụng Next.js
- 🏗️ **Build Backend**: Build ứng dụng NestJS
- 🐳 **Docker Build**: Build và push Docker images
- 🔒 **Security Scan**: Quét lỗ hổng bảo mật với Trivy
- 🚀 **Deploy Staging**: Deploy lên môi trường staging

### 2. 🚀 Production Deployment (`deploy-production.yml`)
**Trigger:** Release published hoặc manual dispatch

**Các bước:**
- ✅ **Validate Release**: Kiểm tra format version
- 🧪 **Full Test Suite**: Chạy toàn bộ test suite
- 🐳 **Build Production Images**: Build Docker images cho production
- 🔒 **Security Scan**: Quét bảo mật cho production images
- 🚀 **Deploy Production**: Deploy lên production
- 🏥 **Health Check**: Kiểm tra sức khỏe sau deploy

### 3. 📦 Dependency Updates (`dependency-update.yml`)
**Trigger:** Scheduled (Thứ 2 hàng tuần) hoặc manual

**Các bước:**
- 📦 **Update Dependencies**: Cập nhật dependencies
- 🧪 **Test Updates**: Kiểm tra sau khi update
- 📝 **Create PR**: Tạo PR tự động cho updates
- 🔒 **Security Audit**: Kiểm tra lỗ hổng bảo mật
- 📊 **Check Outdated**: Báo cáo packages cũ

### 4. 📊 Code Quality & Performance (`code-quality.yml`)
**Trigger:** Push/PR và scheduled (hàng ngày)

**Các bước:**
- 📊 **Code Quality Analysis**: SonarCloud, Codecov
- ⚡ **Performance Testing**: API performance với Artillery
- 🌐 **Frontend Audit**: Lighthouse CI
- 🔒 **Security Analysis**: CodeQL, Semgrep
- 📚 **Documentation Check**: Kiểm tra tài liệu

## 🔧 Setup và Cấu hình

### 1. Repository Secrets

Cần thiết lập các secrets sau trong GitHub repository:

#### 🔑 Authentication & API Keys
```
GEMINI_API_KEY=your_gemini_api_key_here
DOCKER_USERNAME=your_docker_hub_username
DOCKER_PASSWORD=your_docker_hub_password
GITHUB_TOKEN=ghp_xxxxxxxxxxxx (tự động có)
```

#### 🌐 Production Environment
```
PROD_API_URL=https://api.your-domain.com
PROD_APP_URL=https://your-domain.com
```

#### 📊 Code Quality Tools
```
SONAR_TOKEN=your_sonarcloud_token
CODECOV_TOKEN=your_codecov_token
```

#### 📢 Notifications
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

### 2. Environment Setup

#### 🏗️ Staging Environment
```
STAGING_API_URL=https://staging-api.your-domain.com
STAGING_APP_URL=https://staging.your-domain.com
```

#### 🚀 Production Environment
```
PROD_API_URL=https://api.your-domain.com
PROD_APP_URL=https://your-domain.com
```

### 3. External Services Setup

#### 📊 SonarCloud
1. Đăng ký tại [SonarCloud](https://sonarcloud.io/)
2. Import repository
3. Lấy token và thêm vào secrets
4. Cấu hình trong `sonar-project.properties`

#### 📈 Codecov
1. Đăng ký tại [Codecov](https://codecov.io/)
2. Import repository
3. Lấy token và thêm vào secrets

#### 🐳 Docker Hub
1. Tạo repository trên Docker Hub
2. Thêm username/password vào secrets

## 📝 Cách sử dụng

### 🔄 Development Workflow

1. **Tạo feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Push code:**
   ```bash
   git push origin feature/new-feature
   ```

3. **Tạo Pull Request:**
   - CI/CD pipeline sẽ tự động chạy
   - Kiểm tra kết quả tests và quality checks
   - Merge sau khi review

### 🚀 Release Workflow

1. **Tạo release tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Tạo GitHub Release:**
   - Vào GitHub → Releases → Create new release
   - Chọn tag vừa tạo
   - Publish release

3. **Production deployment sẽ tự động chạy**

### 📦 Dependency Management

- Dependencies được update tự động mỗi tuần
- PR sẽ được tạo tự động
- Review và merge PR để áp dụng updates

## 🔍 Monitoring và Debugging

### 📊 Xem kết quả workflows
- Vào tab **Actions** trong GitHub repository
- Click vào workflow run để xem chi tiết
- Download artifacts nếu cần

### 🐛 Debug failed workflows
1. Kiểm tra logs trong GitHub Actions
2. Xem artifacts được upload
3. Chạy lại workflow nếu cần

### 📈 Performance Reports
- Lighthouse reports: Tự động upload
- Performance tests: Check artifacts
- Security scans: Xem trong Security tab

## 🛠️ Customization

### Thêm workflow mới
1. Tạo file `.yml` trong `.github/workflows/`
2. Định nghĩa triggers và jobs
3. Test với workflow_dispatch trước

### Modify existing workflows
1. Edit file workflow tương ứng
2. Test changes trên branch riêng
3. Merge sau khi verify

## 🆘 Troubleshooting

### Common Issues

#### ❌ Docker build fails
- Kiểm tra Dockerfile syntax
- Verify dependencies trong package.json
- Check Docker Hub credentials

#### ❌ Tests fail
- Kiểm tra MongoDB connection
- Verify environment variables
- Check test data setup

#### ❌ Deployment fails
- Verify production secrets
- Check server accessibility
- Review deployment scripts

### 📞 Support
- Tạo issue trong repository
- Tag với label `ci/cd` hoặc `github-actions`
- Provide logs và error messages

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com/)
- [SonarCloud](https://sonarcloud.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
