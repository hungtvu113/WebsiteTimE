# 📊 SonarCloud Setup cho WebsiteTimE

## ❌ Lỗi gặp phải

```
ERROR Failed to query JRE metadata: . Please check the property sonar.token or the environment variable SONAR_TOKEN.
Error: Process completed with exit code 1.
```

## 🔍 Nguyên nhân

Lỗi này xảy ra vì:
- `SONAR_TOKEN` chưa được setup trong GitHub Secrets
- SonarCloud project chưa được tạo
- Token không có quyền truy cập repository

## ✅ Giải pháp đã áp dụng

### 1. **Conditional SonarCloud Scan**

Workflow sẽ skip SonarCloud nếu không có token:

```yaml
- name: 📊 SonarCloud Scan
  if: ${{ secrets.SONAR_TOKEN != '' }}
  uses: SonarSource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  continue-on-error: true
  
- name: ⚠️ SonarCloud Scan Skipped
  if: ${{ secrets.SONAR_TOKEN == '' }}
  run: |
    echo "⚠️ SonarCloud scan skipped - SONAR_TOKEN not configured"
```

### 2. **Alternative Code Analysis**

Khi không có SonarCloud, sử dụng built-in analysis:

```yaml
- name: 📊 Code complexity analysis
  run: |
    echo "📊 Code Complexity Report" > complexity-report.txt
    echo "📁 Total TypeScript files: $(find backend/src -name "*.ts" | wc -l)"
    echo "📄 Total lines of code: $(find backend/src -name "*.ts" -exec wc -l {} +)"
```

## 🚀 Setup SonarCloud (Optional)

### Bước 1: Tạo SonarCloud Account

1. Truy cập [sonarcloud.io](https://sonarcloud.io)
2. Đăng nhập bằng GitHub account
3. Authorize SonarCloud access

### Bước 2: Import Repository

1. Click **"+"** → **"Analyze new project"**
2. Chọn organization (GitHub username)
3. Chọn repository **WebsiteTimE**
4. Click **"Set up"**

### Bước 3: Configure Project

1. **Project Key**: `hungtvu113_WebsiteTimE` (auto-generated)
2. **Organization**: `hungtvu113` (your GitHub username)
3. **Project Name**: `WebsiteTimE`

### Bước 4: Get Token

1. Vào **My Account** → **Security**
2. **Generate Tokens** section
3. **Name**: `WebsiteTimE-GitHub-Actions`
4. **Type**: `Project Analysis Token`
5. **Project**: `WebsiteTimE`
6. Click **Generate**
7. **Copy token** (chỉ hiển thị 1 lần!)

### Bước 5: Add to GitHub Secrets

1. Vào GitHub repository → **Settings**
2. **Secrets and variables** → **Actions**
3. **New repository secret**
4. **Name**: `SONAR_TOKEN`
5. **Value**: Paste token từ SonarCloud
6. **Add secret**

### Bước 6: Update sonar-project.properties

File đã được tạo sẵn, chỉ cần update nếu cần:

```properties
# SonarCloud configuration
sonar.projectKey=hungtvu113_WebsiteTimE
sonar.organization=hungtvu113

# Project information
sonar.projectName=WebsiteTimE
sonar.projectVersion=1.0.0

# Source code
sonar.sources=backend/src,frontend/src
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**

# Test coverage
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info
```

## 📈 Setup Codecov (Optional)

### Bước 1: Tạo Codecov Account

1. Truy cập [codecov.io](https://codecov.io)
2. Đăng nhập bằng GitHub
3. Authorize Codecov

### Bước 2: Add Repository

1. **Add new repository**
2. Chọn **WebsiteTimE**
3. Copy **Repository Upload Token**

### Bước 3: Add to GitHub Secrets

1. GitHub repository → **Settings** → **Secrets**
2. **New repository secret**
3. **Name**: `CODECOV_TOKEN`
4. **Value**: Token từ Codecov
5. **Add secret**

## 🔧 Troubleshooting

### SonarCloud Issues:

#### 1. **Token Permission Error**
```
ERROR: You're not authorized to run analysis
```

**Solution:**
- Verify token có quyền truy cập project
- Regenerate token với đúng permissions
- Check organization membership

#### 2. **Project Not Found**
```
ERROR: Project not found
```

**Solution:**
- Verify `sonar.projectKey` trong `sonar-project.properties`
- Check project exists trong SonarCloud
- Ensure organization name đúng

#### 3. **Coverage Upload Failed**
```
ERROR: Coverage report not found
```

**Solution:**
- Verify test coverage được generate
- Check path trong `sonar.javascript.lcov.reportPaths`
- Ensure tests chạy trước SonarCloud scan

### Codecov Issues:

#### 1. **Upload Failed**
```
ERROR: Failed to upload coverage
```

**Solution:**
- Check `CODECOV_TOKEN` trong secrets
- Verify coverage file exists
- Use correct file path

## 📊 Benefits của SonarCloud

### Code Quality Metrics:
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Coverage**: Test coverage percentage
- **Duplication**: Code duplication percentage

### Quality Gates:
- Automatic pass/fail criteria
- Block merge nếu quality không đạt
- Customizable thresholds

### Trend Analysis:
- Track quality over time
- Compare branches
- Historical data

## 🎯 Alternative Tools

Nếu không muốn dùng SonarCloud:

### 1. **ESLint + Prettier**
```yaml
- name: 🔍 Lint code
  run: |
    pnpm lint
    pnpm format:check
```

### 2. **TypeScript Compiler**
```yaml
- name: 🔧 Type check
  run: |
    pnpm --filter backend tsc --noEmit
    pnpm --filter frontend tsc --noEmit
```

### 3. **Custom Analysis**
```yaml
- name: 📊 Code analysis
  run: |
    # Count TODO/FIXME comments
    grep -r "TODO\|FIXME" src/ || true
    
    # Find large files
    find src/ -name "*.ts" -exec wc -l {} + | sort -nr | head -10
    
    # Check for console.log
    grep -r "console.log" src/ || true
```

## ✅ Current Status

Workflow hiện tại sẽ:
- ✅ **Skip SonarCloud** nếu không có token
- ✅ **Run alternative analysis** với built-in tools
- ✅ **Continue workflow** không bị fail
- ✅ **Upload reports** as artifacts
- ✅ **Show helpful messages** về setup

## 📚 Resources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Codecov Documentation](https://docs.codecov.com/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**🎉 Code quality analysis sẽ chạy thành công dù có hay không có SonarCloud!**
