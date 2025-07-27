# 🚀 GitHub Actions CI/CD Setup cho WebsiteTimE

## 📋 Tổng quan

✅ **HOÀN TẤT!** Tôi đã tạo một hệ thống CI/CD hoàn chỉnh cho dự án WebsiteTimE của bạn với GitHub Actions. Hệ thống này bao gồm:

### 🔄 4 Workflows chính:

1. **CI/CD Pipeline** (`ci-cd.yml`) - Chạy khi push/PR
2. **Production Deployment** (`deploy-production.yml`) - Chạy khi release
3. **Dependency Updates** (`dependency-update.yml`) - Chạy hàng tuần
4. **Code Quality & Performance** (`code-quality.yml`) - Chạy hàng ngày

### 📁 Files đã tạo:

```
.github/
├── workflows/
│   ├── ci-cd.yml                    # Main CI/CD pipeline
│   ├── deploy-production.yml        # Production deployment
│   ├── dependency-update.yml        # Dependency management
│   └── code-quality.yml            # Code quality & performance
└── README.md                        # Hướng dẫn chi tiết

.lighthouserc.json                   # Lighthouse CI config
sonar-project.properties             # SonarCloud config
performance-test.yml                 # Artillery performance tests
setup-github-actions.sh              # Setup script (Linux/Mac)
setup-github-actions.bat             # Setup script (Windows)
```

## 🚀 Cách bắt đầu

### Bước 1: Chạy setup script

**Windows:**
```bash
setup-github-actions.bat
```

**Linux/Mac:**
```bash
chmod +x setup-github-actions.sh
./setup-github-actions.sh
```

### Bước 2: Setup GitHub Secrets

Cần thiết lập các secrets sau trong GitHub repository (Settings → Secrets and variables → Actions):

#### 🔑 Bắt buộc:
- `GEMINI_API_KEY` - Google Gemini API key
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `PROD_API_URL` - Production API URL
- `PROD_APP_URL` - Production app URL

#### 📊 Tùy chọn (cho code quality):
- `SONAR_TOKEN` - SonarCloud token
- `CODECOV_TOKEN` - Codecov token
- `SLACK_WEBHOOK_URL` - Slack webhook cho notifications

### Bước 3: Setup External Services

#### 🐳 Docker Hub
1. Tạo repository: `your-username/websitetime-backend` và `your-username/websitetime-frontend`
2. Tạo access token và thêm vào secrets

#### 📊 SonarCloud (Optional)
1. Đăng ký tại [sonarcloud.io](https://sonarcloud.io)
2. Import repository
3. Lấy token và thêm vào secrets

#### 📈 Codecov (Optional)
1. Đăng ký tại [codecov.io](https://codecov.io)
2. Import repository
3. Lấy token và thêm vào secrets

## 🔄 Workflow Details

### 1. CI/CD Pipeline (ci-cd.yml)

**Triggers:** Push/PR vào `main`, `develop`

**Jobs:**
- 🔍 **Lint**: ESLint cho backend và frontend
- 🧪 **Test Backend**: Unit tests với MongoDB
- 🏗️ **Build Frontend**: Next.js build
- 🏗️ **Build Backend**: NestJS build
- 🐳 **Docker Build**: Build và push images
- 🔒 **Security Scan**: Trivy vulnerability scan
- 🚀 **Deploy Staging**: Deploy lên staging (chỉ main branch)

### 2. Production Deployment (deploy-production.yml)

**Triggers:** GitHub Release hoặc manual dispatch

**Jobs:**
- ✅ **Validate Release**: Kiểm tra version format
- 🧪 **Full Test Suite**: Chạy toàn bộ tests
- 🐳 **Build Production Images**: Build với production tags
- 🔒 **Security Scan**: Scan production images
- 🚀 **Deploy Production**: Deploy với approval
- 🏥 **Health Check**: Kiểm tra sau deploy

### 3. Dependency Updates (dependency-update.yml)

**Triggers:** Scheduled (Thứ 2 hàng tuần) hoặc manual

**Features:**
- 📦 Auto update dependencies
- 🧪 Test sau khi update
- 📝 Tạo PR tự động
- 🔒 Security audit
- 📊 Report outdated packages

### 4. Code Quality & Performance (code-quality.yml)

**Triggers:** Push/PR và scheduled (hàng ngày)

**Features:**
- 📊 SonarCloud analysis
- ⚡ API performance testing với Artillery
- 🌐 Frontend Lighthouse audit
- 🔒 Security analysis (CodeQL, Semgrep)
- 📚 Documentation checks

## 📊 Monitoring & Reports

### 🔍 Xem kết quả:
- **GitHub Actions tab**: Xem workflow runs
- **Security tab**: Security alerts và scans
- **Pull Requests**: Automated checks
- **Artifacts**: Download reports

### 📈 Performance Monitoring:
- **Lighthouse reports**: Frontend performance
- **Artillery reports**: API performance
- **SonarCloud**: Code quality metrics
- **Codecov**: Test coverage

## 🛠️ Customization

### Thêm environment mới:
1. Tạo environment trong GitHub Settings
2. Thêm secrets cho environment đó
3. Update workflow để deploy vào environment

### Modify workflows:
1. Edit file `.yml` tương ứng
2. Test trên branch riêng trước
3. Merge sau khi verify

### Thêm tests mới:
1. Thêm test commands vào `package.json`
2. Update workflow để chạy tests
3. Cấu hình coverage reporting

## 🔧 Troubleshooting

### ❌ Common Issues:

#### Docker build fails:
- Kiểm tra Dockerfile syntax
- Verify dependencies trong package.json
- Check Docker Hub credentials

#### Tests fail:
- Kiểm tra MongoDB connection
- Verify environment variables
- Check test data setup

#### Deployment fails:
- Verify production secrets
- Check server accessibility
- Review deployment scripts

### 🆘 Debug Steps:
1. Xem logs trong GitHub Actions
2. Download artifacts để analyze
3. Chạy lại workflow với debug mode
4. Check external services status

## 📚 Next Steps

### 🚀 Immediate:
1. **Commit và push** tất cả files lên GitHub
2. **Setup secrets** theo hướng dẫn
3. **Tạo PR** để test CI pipeline
4. **Verify** tất cả workflows chạy thành công

### 📈 Advanced:
1. **Setup monitoring** với external tools
2. **Configure notifications** (Slack, email)
3. **Add more environments** (staging, QA)
4. **Implement blue-green deployment**

### 🔒 Security:
1. **Enable branch protection** rules
2. **Require PR reviews** trước khi merge
3. **Setup CODEOWNERS** file
4. **Regular security audits**

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra `.github/README.md` cho hướng dẫn chi tiết
2. Xem logs trong GitHub Actions
3. Tạo issue với label `ci/cd`
4. Provide logs và error messages

---

**🎉 Chúc mừng! Bạn đã có một hệ thống CI/CD hoàn chỉnh cho dự án WebsiteTimE!**
