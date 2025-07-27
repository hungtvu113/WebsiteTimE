# 🚀 GitHub Actions CI/CD cho WebsiteTimE

## 📋 Tổng quan

Hệ thống CI/CD hoàn chỉnh cho dự án WebsiteTimE với 4 workflows chính:

### 🔄 Workflows

1. **[CI/CD Pipeline](workflows/ci-cd.yml)** - Main pipeline cho development
2. **[Production Deployment](workflows/deploy-production.yml)** - Production releases
3. **[Dependency Updates](workflows/dependency-update.yml)** - Automated dependency management
4. **[Code Quality & Performance](workflows/code-quality.yml)** - Quality assurance

## 🚀 Quick Start

### 1. Chạy Setup Script

**Windows:**
```bash
setup-github-actions.bat
```

**Linux/Mac:**
```bash
chmod +x setup-github-actions.sh
./setup-github-actions.sh
```

### 2. Setup GitHub Secrets

Vào **Settings → Secrets and variables → Actions** và thêm:

#### 🔑 Required Secrets:
- `GEMINI_API_KEY` - Google Gemini API key
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token
- `PROD_API_URL` - Production API URL
- `PROD_APP_URL` - Production app URL

#### 📊 Optional Secrets:
- `SONAR_TOKEN` - SonarCloud token
- `CODECOV_TOKEN` - Codecov token
- `SLACK_WEBHOOK_URL` - Slack notifications

## 🔄 Workflow Details

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:** Push/PR to `main`, `develop`

**Jobs:**
- 🔍 **Lint & Format** - ESLint + Prettier
- 🧪 **Backend Tests** - Unit tests với MongoDB
- 🏗️ **Build Frontend** - Next.js build
- 🏗️ **Build Backend** - NestJS build
- 🐳 **Docker Build** - Build và push images
- 🔒 **Security Scan** - Trivy vulnerability scan
- 🚀 **Deploy Staging** - Auto deploy to staging (main branch only)

### 2. Production Deployment (`deploy-production.yml`)

**Triggers:** GitHub Release hoặc manual dispatch

**Jobs:**
- ✅ **Validate Release** - Version format validation
- 🧪 **Full Test Suite** - Complete test run
- 🏗️ **Build Production** - Production images
- 🔒 **Security Scan** - Production security check
- 🚀 **Deploy Production** - Production deployment với approval
- 🏥 **Health Check** - Post-deployment verification
- 📢 **Notify** - Slack/Email notifications

### 3. Dependency Updates (`dependency-update.yml`)

**Triggers:** Weekly schedule (Mondays) hoặc manual

**Features:**
- 📦 Check for outdated packages
- 🔄 Auto update dependencies
- 🧪 Test after updates
- 📝 Create PR automatically
- 🔒 Security audit
- 📊 Dependency reports

### 4. Code Quality & Performance (`code-quality.yml`)

**Triggers:** Push/PR và daily schedule

**Features:**
- 📊 **SonarCloud Analysis** - Code quality metrics
- ⚡ **Performance Testing** - API performance với Artillery
- 🌐 **Lighthouse Audit** - Frontend performance
- 🔒 **Security Analysis** - CodeQL + Semgrep
- 📚 **Documentation Check** - README và comment analysis

## 🛠️ Configuration Files

### Core Files
- `.github/workflows/*.yml` - Workflow definitions
- `.lighthouserc.json` - Lighthouse CI config
- `sonar-project.properties` - SonarCloud config
- `performance-test.yml` - Artillery performance tests

### Setup Scripts
- `setup-github-actions.sh` - Linux/Mac setup
- `setup-github-actions.bat` - Windows setup

## 📊 Monitoring & Reports

### 🔍 Xem kết quả:
- **Actions tab** - Workflow runs và logs
- **Security tab** - Security alerts
- **Pull Requests** - Automated checks
- **Artifacts** - Download reports

### 📈 External Services:
- **SonarCloud** - Code quality dashboard
- **Codecov** - Test coverage reports
- **Docker Hub** - Container images
- **Slack** - Deployment notifications

## 🔧 Customization

### Thêm Environment Mới
```yaml
# Trong workflow file
environment:
  name: your-environment
  url: ${{ steps.deploy.outputs.url }}
```

### Modify Performance Thresholds
```yaml
# Trong performance-test.yml
phases:
  - duration: 60
    arrivalRate: 10  # Adjust load
```

### Update Security Scan Settings
```yaml
# Trong workflow
severity: 'CRITICAL,HIGH'  # Adjust severity levels
```

## 🔒 Security Best Practices

### Branch Protection
1. Vào **Settings → Branches**
2. Add rule cho `main` branch:
   - Require PR reviews
   - Require status checks
   - Restrict pushes

### Secret Management
- Sử dụng GitHub Secrets cho sensitive data
- Rotate secrets định kỳ
- Limit secret access theo environment

### Dependency Security
- Enable Dependabot alerts
- Review dependency updates
- Monitor security advisories

## 🚀 Deployment Strategies

### Staging Deployment
- Auto deploy từ `main` branch
- Smoke tests sau deployment
- Environment-specific configs

### Production Deployment
- Manual approval required
- Blue-green deployment ready
- Rollback capabilities
- Health checks

## 📚 Troubleshooting

### ❌ Common Issues

#### Docker Build Fails
```bash
# Check Dockerfile syntax
docker build -t test .

# Verify dependencies
pnpm install --frozen-lockfile
```

#### Tests Fail
```bash
# Check MongoDB connection
docker run -d -p 27017:27017 mongo:6.0

# Verify environment variables
cat .env.example
```

#### Deployment Fails
```bash
# Check secrets
gh secret list

# Verify server access
curl -f $PROD_API_URL/health
```

### 🆘 Debug Steps
1. Check workflow logs trong Actions tab
2. Download artifacts để analyze
3. Run workflows locally với `act`
4. Verify external service status

## 📈 Performance Optimization

### Workflow Performance
- Cache dependencies
- Parallel job execution
- Conditional job runs
- Artifact optimization

### Build Performance
- Multi-stage Docker builds
- Layer caching
- Dependency optimization
- Build parallelization

## 🔄 Maintenance

### Weekly Tasks
- Review dependency updates
- Check security alerts
- Monitor performance metrics
- Update documentation

### Monthly Tasks
- Rotate secrets
- Review workflow efficiency
- Update external service configs
- Performance baseline updates

## 📞 Support

### Getting Help
1. Check workflow logs
2. Review this documentation
3. Create issue với `ci/cd` label
4. Include logs và error messages

### Useful Commands
```bash
# Check workflow status
gh run list

# View workflow logs
gh run view <run-id>

# Trigger manual workflow
gh workflow run deploy-production.yml

# List secrets
gh secret list
```

---

**🎉 Happy Deploying! Chúc bạn có một hệ thống CI/CD mạnh mẽ và ổn định!**
