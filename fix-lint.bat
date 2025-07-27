@echo off
REM 🔧 Fix Lint Issues Script for Windows
echo 🔧 Fixing lint issues in WebsiteTimE project...

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install pnpm first.
    exit /b 1
)

echo ✅ Starting lint fixes...

REM Install dependencies if needed
if not exist "node_modules" (
    echo ⚠️ Installing dependencies...
    pnpm install
)

REM Fix backend lint issues
echo ✅ Fixing backend lint issues...
pnpm backend:lint:fix
if %errorlevel% equ 0 (
    echo ✅ Backend lint fixes applied successfully
) else (
    echo ⚠️ Some backend lint issues may require manual fixing
)

REM Fix frontend lint issues
echo ✅ Fixing frontend lint issues...
pnpm frontend:lint:fix
if %errorlevel% equ 0 (
    echo ✅ Frontend lint fixes applied successfully
) else (
    echo ⚠️ Some frontend lint issues may require manual fixing
)

REM Run lint check to see remaining issues
echo ✅ Checking remaining lint issues...

echo.
echo 📊 Backend lint status:
pnpm backend:lint
if %errorlevel% equ 0 (
    echo ✅ Backend: No lint issues remaining
) else (
    echo ⚠️ Backend: Some lint issues remain (check output above)
)

echo.
echo 📊 Frontend lint status:
pnpm frontend:lint
if %errorlevel% equ 0 (
    echo ✅ Frontend: No lint issues remaining
) else (
    echo ⚠️ Frontend: Some lint issues remain (check output above)
)

echo.
echo ✅ Lint fix process completed!
echo.
echo 📝 Next steps:
echo 1. Review any remaining lint warnings above
echo 2. Commit the fixed files: git add . ^&^& git commit -m "🔧 Fix lint issues"
echo 3. Push changes: git push
echo.
echo 🚀 Your CI/CD pipeline should now pass the lint checks!

pause
