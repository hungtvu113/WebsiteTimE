# 📊 SonarCloud Setup Guide

## 📋 Overview

SonarCloud provides code quality analysis for your project. This guide will help you set it up.

## 🚀 Quick Setup

### 1. **Create SonarCloud Account**

1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Click "Log in" → "With GitHub"
3. Authorize SonarCloud to access your GitHub account

### 2. **Import Your Repository**

1. Click "+" → "Analyze new project"
2. Select your GitHub organization
3. Choose "WebsiteTimE" repository
4. Click "Set up"

### 3. **Configure Project**

1. **Project Key**: Should be auto-generated (e.g., `your-username_WebsiteTimE`)
2. **Organization**: Your GitHub username or organization
3. **Project Name**: WebsiteTimE
4. Click "Set up project"

### 4. **Get Your Token**

1. Go to "My Account" → "Security"
2. Generate a new token:
   - **Name**: `WebsiteTimE-GitHub-Actions`
   - **Type**: Project Analysis Token
   - **Project**: Select your WebsiteTimE project
3. Copy the generated token

### 5. **Add Token to GitHub Secrets**

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. **Name**: `SONAR_TOKEN`
5. **Value**: Paste the token from step 4
6. Click "Add secret"

### 6. **Update Project Configuration**

Update `sonar-project.properties` with your actual values:

```properties
# SonarCloud configuration
sonar.projectKey=YOUR_USERNAME_WebsiteTimE
sonar.organization=YOUR_USERNAME

# Project information
sonar.projectName=WebsiteTimE
sonar.projectVersion=1.0.0

# Source code
sonar.sources=backend/src,frontend/src
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/*.spec.ts,**/*.test.ts

# Test coverage
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info
sonar.testExecutionReportPaths=backend/coverage/test-reporter.xml

# Language settings
sonar.typescript.node=node_modules/typescript/lib/typescript.js
```

## 🔧 Troubleshooting

### ❌ "Failed to query JRE metadata"

**Problem**: Missing or invalid SONAR_TOKEN

**Solution**:
1. Verify token is added to GitHub secrets
2. Check token has correct permissions
3. Regenerate token if needed

### ❌ "Project not found"

**Problem**: Incorrect project key or organization

**Solution**:
1. Check `sonar-project.properties` values
2. Verify project exists in SonarCloud
3. Update configuration with correct values

### ❌ "Quality Gate failed"

**Problem**: Code quality issues detected

**Solution**:
1. Review SonarCloud dashboard
2. Fix reported issues
3. Re-run the workflow

## 📊 Understanding Results

### **Quality Gate**
- ✅ **Passed**: Code meets quality standards
- ❌ **Failed**: Issues need to be addressed

### **Key Metrics**
- **Coverage**: Test coverage percentage
- **Duplications**: Code duplication percentage
- **Maintainability**: Technical debt ratio
- **Reliability**: Bug count
- **Security**: Security hotspots and vulnerabilities

### **Viewing Reports**
1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Find your project
3. Review dashboard and detailed reports

## ⚙️ Advanced Configuration

### **Custom Quality Gate**
1. Go to Quality Gates in SonarCloud
2. Create custom gate or modify existing
3. Set thresholds for your project

### **Branch Analysis**
SonarCloud automatically analyzes:
- Main branch
- Pull requests
- Feature branches

### **Exclude Files**
Add to `sonar-project.properties`:
```properties
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/coverage/**,**/*.spec.ts,**/*.test.ts,**/migrations/**
```

## 🔄 Workflow Integration

### **Automatic Analysis**
- Runs on every push to main/develop
- Analyzes pull requests
- Provides quality gate status

### **Manual Trigger**
```bash
# Trigger workflow manually
gh workflow run code-quality.yml
```

### **Skip SonarCloud**
If SONAR_TOKEN is not configured, the workflow will:
- ✅ Continue running other jobs
- ⚠️ Show warning about skipped analysis
- 📝 Provide setup instructions

## 📈 Best Practices

### **Code Quality**
- Maintain >80% test coverage
- Keep technical debt low
- Fix security vulnerabilities promptly
- Reduce code duplication

### **Workflow Optimization**
- Run analysis on main branches
- Use quality gate to block bad PRs
- Monitor trends over time
- Set up notifications for failures

## 🆘 Getting Help

### **SonarCloud Documentation**
- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [GitHub Integration](https://docs.sonarcloud.io/getting-started/github/)

### **Common Issues**
1. **Token expired**: Regenerate in SonarCloud
2. **Project not found**: Check configuration
3. **Analysis failed**: Review logs in GitHub Actions

### **Support Channels**
- SonarCloud Community Forum
- GitHub Issues for this project
- SonarCloud Support (for paid plans)

---

## 📝 Summary

After setup:
- ✅ Code quality analysis on every push
- ✅ Pull request quality gates
- ✅ Detailed quality reports
- ✅ Trend analysis over time
- ✅ Security vulnerability detection

**Note**: SonarCloud analysis is optional. If not configured, workflows will continue running without it.
