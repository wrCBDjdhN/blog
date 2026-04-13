@echo off
REM Blog Deploy Script for Windows
REM Usage: Double-click or run in cmd

echo.
echo ========================================
echo    🚀 Blog Deploy Script
echo ========================================
echo.

REM Check for changes
for /f "delims=" %%i in ('git status --porcelain') do set has_changes=1

if not defined has_changes (
    echo ✅ No changes to deploy
    exit /b 0
)

echo 📝 Changed files:
git status --short
echo.

set /p commit_msg=📋 Enter commit message (or press Enter for auto-generated): 

if "%commit_msg%"=="" (
    set commit_msg=chore: code updates
)

echo.
echo 📦 Files to commit:
git diff --name-only
echo.

set /p confirm=Proceed with commit and push? (y/n): 

if /i not "%confirm%"=="y" (
    echo ❌ Deployment cancelled
    exit /b 1
)

echo.
echo 📦 Staging changes...
git add -A

echo 💾 Committing...
git commit -m "%commit_msg%"

echo 🚀 Pushing to GitHub...
git push

echo.
echo ✅ Deployment complete!
echo 🌐 Vercel will deploy automatically
echo.
pause
