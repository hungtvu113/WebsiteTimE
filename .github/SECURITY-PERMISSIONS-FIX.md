# 🔒 Khắc phục lỗi Security Permissions trong GitHub Actions

## ❌ Lỗi gặp phải

```
Warning: Resource not accessible by integration - https://docs.github.com/rest
Error: Resource not accessible by integration - https://docs.github.com/rest
```

## 🔍 Nguyên nhân

Lỗi này xảy ra khi GitHub Actions không có đủ quyền để:
- Upload SARIF files lên Security tab
- Tạo security alerts
- Truy cập GitHub Security API

## ✅ Giải pháp đã áp dụng

### 1. Thêm permissions ở workflow level

Đã thêm `permissions` block vào tất cả workflows:

```yaml
permissions:
  contents: read
  security-events: write  # Quan trọng cho security scanning
  actions: read
  pull-requests: write
```

### 2. Thêm permissions ở job level

Cho các job security scanning cụ thể:

```yaml
security-scan:
  name: 🔒 Security Scan
  runs-on: ubuntu-latest
  permissions:
    security-events: write
    actions: read
    contents: read
```

### 3. Cải thiện error handling

- Thêm `if: always()` để upload kết quả dù có lỗi
- Thêm `continue-on-error: true` cho các bước không critical
- Tách riêng upload cho từng component

## 🛠️ Cấu hình Repository Settings

### Bước 1: Kiểm tra Repository Settings

1. Vào **Settings** → **Actions** → **General**
2. Trong phần **Workflow permissions**, chọn:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### Bước 2: Kiểm tra Security Settings

1. Vào **Settings** → **Code security and analysis**
2. Bật các tính năng sau:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Code scanning alerts**
   - ✅ **Secret scanning alerts**

### Bước 3: Kiểm tra Branch Protection

1. Vào **Settings** → **Branches**
2. Đảm bảo branch protection rules không block security uploads

## 🔧 Troubleshooting

### Nếu vẫn gặp lỗi:

#### 1. Kiểm tra Token Permissions
```bash
# Kiểm tra permissions của GITHUB_TOKEN
gh api user --jq '.permissions'
```

#### 2. Sử dụng Personal Access Token (nếu cần)
Tạo PAT với scopes:
- `repo` (full control)
- `security_events` (write security events)

Thêm vào repository secrets:
```
SECURITY_TOKEN=ghp_xxxxxxxxxxxx
```

Sử dụng trong workflow:
```yaml
- name: 📤 Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'results.sarif'
    token: ${{ secrets.SECURITY_TOKEN }}
```

#### 3. Alternative: Upload as Artifacts
Nếu không thể upload lên Security tab, upload as artifacts:

```yaml
- name: 📤 Upload security results as artifacts
  uses: actions/upload-artifact@v4
  with:
    name: security-scan-results
    path: |
      *.sarif
      security-*.json
    retention-days: 30
```

## 📊 Xác minh Fix

### 1. Kiểm tra Workflow Run
- Vào **Actions** tab
- Chạy workflow và kiểm tra logs
- Không còn thấy warning/error về permissions

### 2. Kiểm tra Security Tab
- Vào **Security** tab
- Xem **Code scanning alerts**
- Đảm bảo có kết quả từ Trivy và CodeQL

### 3. Kiểm tra SARIF Upload
Logs sẽ hiển thị:
```
✅ Successfully uploaded SARIF file
📊 Found X vulnerabilities
🔒 Security alerts created
```

## 🚀 Workflow Updates Applied

### CI/CD Pipeline (`ci-cd.yml`)
- ✅ Thêm top-level permissions
- ✅ Cải thiện security-scan job
- ✅ Tách riêng upload cho backend/frontend
- ✅ Thêm error handling

### Code Quality (`code-quality.yml`)
- ✅ Thêm permissions cho security-analysis job
- ✅ Cải thiện CodeQL và Semgrep integration
- ✅ Better error handling cho npm audit

### Production Deployment (`deploy-production.yml`)
- ✅ Enhanced production security scanning
- ✅ Dual format output (SARIF + table)
- ✅ Critical vulnerability checking

## 📚 Tài liệu tham khảo

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [SARIF Upload API](https://docs.github.com/en/rest/code-scanning#upload-an-analysis-as-sarif-data)
- [CodeQL Action](https://github.com/github/codeql-action)
- [Trivy Action](https://github.com/aquasecurity/trivy-action)

## ✅ Kết quả mong đợi

Sau khi áp dụng fix:
- ✅ Không còn permission errors
- ✅ Security scan results xuất hiện trong Security tab
- ✅ SARIF files được upload thành công
- ✅ Security alerts được tạo tự động
- ✅ Workflow runs hoàn thành thành công

---

**🎉 Security permissions đã được khắc phục hoàn toàn!**
