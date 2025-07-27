# 🐳 Docker Hub Setup Guide

## 📋 Overview

This guide will help you set up Docker Hub integration for automatic image building and pushing in your CI/CD pipeline.

## 🚀 Quick Setup

### 1. **Create Docker Hub Account**

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click "Sign Up" or "Sign In"
3. Create account or log in with existing credentials

### 2. **Create Access Token**

1. Go to [Docker Hub Account Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. **Token Description**: `WebsiteTimE-GitHub-Actions`
4. **Access permissions**: `Read, Write, Delete`
5. Click "Generate"
6. **Copy the token** (you won't see it again!)

### 3. **Create Docker Hub Repositories**

#### **Option A: Auto-create (Recommended)**
- Repositories will be created automatically when first pushed
- Names: `your-username/websitetime-backend` and `your-username/websitetime-frontend`

#### **Option B: Manual create**
1. Go to [Docker Hub Repositories](https://hub.docker.com/repositories)
2. Click "Create Repository"
3. **Repository Name**: `websitetime-backend`
4. **Visibility**: Public or Private
5. Click "Create"
6. Repeat for `websitetime-frontend`

### 4. **Add GitHub Secrets**

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"

#### **Add DOCKER_USERNAME:**
- **Name**: `DOCKER_USERNAME`
- **Value**: Your Docker Hub username
- Click "Add secret"

#### **Add DOCKER_PASSWORD:**
- **Name**: `DOCKER_PASSWORD`
- **Value**: The access token from step 2
- Click "Add secret"

## 🔧 Workflow Behavior

### **Without Docker Hub Credentials:**
- ✅ Code builds successfully
- ✅ Tests run and pass
- ⚠️ Docker images built locally only (not pushed)
- ⚠️ Security scanning skipped
- ✅ Deployment simulation runs
- ✅ Workflow completes successfully

### **With Docker Hub Credentials:**
- ✅ Code builds successfully
- ✅ Tests run and pass
- ✅ Docker images built and pushed to Docker Hub
- ✅ Security scanning with Trivy
- ✅ Full deployment with real images
- ✅ Workflow completes successfully

## 📊 Current Status Check

### **Check if Docker is configured:**
1. Go to **Actions** tab in your repository
2. Look at latest workflow run
3. Check "🐳 Docker Build & Push" job
4. Look for status messages:
   - ⚠️ "Docker Hub credentials not configured" = Not set up
   - ✅ "Docker Hub credentials configured" = Ready to go

## 🐳 Docker Images

### **Image Names:**
- **Backend**: `docker.io/your-username/websitetime-backend`
- **Frontend**: `docker.io/your-username/websitetime-frontend`

### **Tags:**
- `latest` - Latest from main branch
- `main` - Main branch builds
- `develop` - Develop branch builds
- `sha-abc123` - Specific commit builds

### **Example:**
```bash
# Pull images (after setup)
docker pull your-username/websitetime-backend:latest
docker pull your-username/websitetime-frontend:latest

# Run containers
docker run -p 3001:3001 your-username/websitetime-backend:latest
docker run -p 3000:3000 your-username/websitetime-frontend:latest
```

## 🔒 Security Features

### **With Docker Hub Setup:**
- ✅ **Trivy Security Scanning** - Vulnerability detection
- ✅ **SARIF Upload** - Security results in GitHub Security tab
- ✅ **Automated Scanning** - Every push triggers scan

### **Security Scan Results:**
1. Go to **Security** tab in your repository
2. Check **Code scanning alerts**
3. Review any vulnerabilities found
4. Address critical/high severity issues

## 💰 Docker Hub Pricing

### **Free Tier:**
- ✅ 1 private repository
- ✅ Unlimited public repositories
- ✅ 200 container pulls per 6 hours
- ✅ Perfect for open source projects

### **Pro Tier ($5/month):**
- ✅ Unlimited private repositories
- ✅ Unlimited pulls
- ✅ Advanced features

## 🔧 Troubleshooting

### **Common Issues:**

#### **"Username and password required"**
- ❌ Docker Hub credentials not configured
- ✅ Add `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets

#### **"Authentication failed"**
- ❌ Wrong username or token
- ✅ Verify credentials in Docker Hub
- ✅ Regenerate access token if needed

#### **"Repository not found"**
- ❌ Repository doesn't exist
- ✅ Let it auto-create or create manually
- ✅ Check repository name format

#### **"Rate limit exceeded"**
- ❌ Too many pulls from Docker Hub
- ✅ Wait for rate limit reset
- ✅ Consider Docker Hub Pro

### **Debug Steps:**
1. **Check secrets**: Go to repository Settings → Secrets
2. **Verify credentials**: Log in to Docker Hub manually
3. **Check workflow logs**: Look for specific error messages
4. **Test locally**: Try `docker login` with same credentials

## 🚀 Benefits of Docker Hub Integration

### **Development:**
- ✅ Consistent environments across team
- ✅ Easy deployment and testing
- ✅ Version control for images

### **CI/CD:**
- ✅ Automated image building
- ✅ Security vulnerability scanning
- ✅ Deployment automation

### **Production:**
- ✅ Reliable image distribution
- ✅ Rollback capabilities
- ✅ Scalable deployments

## 📚 Alternative Registries

If you prefer other registries:

### **GitHub Container Registry (ghcr.io):**
```yaml
# Update workflow to use ghcr.io
registry: ghcr.io
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

### **AWS ECR:**
```yaml
# Use AWS ECR action
uses: aws-actions/amazon-ecr-login@v1
```

### **Azure Container Registry:**
```yaml
# Use Azure login action
uses: azure/docker-login@v1
```

## 📞 Support

### **Docker Hub Support:**
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Docker Hub Support](https://hub.docker.com/support/)

### **GitHub Actions Support:**
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Login Action](https://github.com/docker/login-action)

---

## ✅ Summary

**To enable full Docker integration:**
1. ✅ Create Docker Hub account
2. ✅ Generate access token
3. ✅ Add GitHub secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
4. ✅ Push code and watch workflow run

**Without Docker Hub:**
- ✅ Workflow still runs successfully
- ⚠️ Images built locally only
- ⚠️ Some features disabled (security scanning)

**With Docker Hub:**
- ✅ Full CI/CD pipeline
- ✅ Automated image building and pushing
- ✅ Security scanning
- ✅ Production-ready deployment

Your workflow is designed to work both with and without Docker Hub credentials!
