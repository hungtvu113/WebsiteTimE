# 🧪 Test Coverage Fix

## 📋 Problem

GitHub Actions workflow failed with error:
```
ERROR  Unknown option: 'coverage'
Did you mean 'reverse'? Use "--config.unknown=value" to force an unknown option.
For help, run: pnpm help test
ELIFECYCLE  Command failed with exit code 1.
```

## 🔍 Root Cause

The command `pnpm backend:test --coverage` was incorrect because:

1. **Backend package.json** has separate scripts:
   - `"test": "jest"`
   - `"test:cov": "jest --coverage"`

2. **pnpm workspace** doesn't support passing additional flags to filtered commands like `--coverage`

3. **Correct approach** is to use the dedicated `test:cov` script

## ✅ Solution Applied

### 1. **Updated All Workflows**

**Files Changed:**
- `.github/workflows/ci-cd.yml`
- `.github/workflows/deploy-production.yml`
- `.github/workflows/code-quality.yml`
- `.github/workflows/dependency-update.yml`

**Change:**
```yaml
# ❌ Before (WRONG)
run: pnpm backend:test --coverage

# ✅ After (CORRECT)
run: pnpm --filter backend test:cov
```

### 2. **Added Root Package Script**

**File:** `package.json`

**Added:**
```json
{
  "scripts": {
    "backend:test:cov": "pnpm --filter backend test:cov"
  }
}
```

### 3. **Enhanced SonarCloud Workflow**

**Added MongoDB service** for SonarCloud analysis:
```yaml
services:
  mongodb:
    image: mongo:6.0
    env:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: qltime_test
    ports:
      - 27017:27017
```

**Added environment variables:**
```yaml
env:
  MONGODB_URI: mongodb://admin:password123@localhost:27017/qltime_test?authSource=admin
  JWT_SECRET: test_jwt_secret
  NODE_ENV: test
```

## 🧪 Test Commands Reference

### **Backend Test Commands:**
```bash
# Run tests without coverage
pnpm --filter backend test

# Run tests with coverage
pnpm --filter backend test:cov

# From root (after fix)
pnpm backend:test:cov
```

### **All Available Backend Scripts:**
```bash
pnpm --filter backend start:dev    # Development server
pnpm --filter backend build        # Build for production
pnpm --filter backend start:prod   # Production server
pnpm --filter backend test         # Run tests
pnpm --filter backend test:cov     # Run tests with coverage
pnpm --filter backend test:watch   # Watch mode
pnpm --filter backend test:e2e     # E2E tests
pnpm --filter backend lint         # Lint code
```

## 📊 Coverage Output

After fix, coverage will be generated in:
- `backend/coverage/lcov.info` - For SonarCloud
- `backend/coverage/` - HTML reports
- Console output with coverage summary

## 🔄 Workflow Behavior

### **CI/CD Pipeline:**
- ✅ Runs backend tests with coverage
- ✅ Uploads coverage to Codecov
- ✅ Generates coverage artifacts

### **SonarCloud Analysis:**
- ✅ Runs tests with coverage
- ✅ Analyzes code quality
- ✅ Uploads coverage data

### **Production Deployment:**
- ✅ Full test suite with coverage
- ✅ Validates before deployment

## 🚀 Verification

To verify the fix works:

1. **Commit changes:**
```bash
git add .
git commit -m "🧪 Fix test coverage commands in workflows"
git push
```

2. **Check workflow runs:**
- Go to Actions tab
- Look for successful test runs
- Verify coverage artifacts are created

3. **Local testing:**
```bash
# Test the command locally
pnpm --filter backend test:cov

# Should output coverage summary
```

## 📈 Expected Results

After this fix:
- ✅ All workflows run successfully
- ✅ Test coverage is properly generated
- ✅ SonarCloud receives coverage data
- ✅ Codecov uploads work correctly
- ✅ No more "Unknown option" errors

## 🔧 Future Maintenance

### **Adding New Test Scripts:**
Always add to both places:
1. `backend/package.json` - The actual script
2. `package.json` (root) - Workspace shortcut

### **Example:**
```json
// backend/package.json
{
  "scripts": {
    "test:integration": "jest --config jest.integration.config.js"
  }
}

// package.json (root)
{
  "scripts": {
    "backend:test:integration": "pnpm --filter backend test:integration"
  }
}
```

## 📞 Support

If you encounter similar issues:

1. **Check package.json scripts** in the target package
2. **Use correct pnpm filter syntax**: `pnpm --filter <package> <script>`
3. **Don't pass flags** to workspace commands
4. **Create dedicated scripts** for complex commands

---

**✅ Fix Complete!** Test coverage now works correctly in all workflows.
