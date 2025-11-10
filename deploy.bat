@echo off
REM Quick deploy script for Cloudflare Pages (Windows)
REM This script builds and deploys the app to Cloudflare Pages

echo ========================================
echo   QuakeWeather - Deployment Script
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  WARNING: .env file not found!
    echo.
    echo For local builds, you need to create a .env file with:
    echo   VITE_MAPBOX_TOKEN=your_mapbox_token_here
    echo.
    echo Copy .env.example to .env and fill in your token:
    echo   copy .env.example .env
    echo.
    echo Alternatively, set the environment variable:
    echo   set VITE_MAPBOX_TOKEN=your_token_here
    echo.
    pause
    exit /b 1
)

echo 🚀 Building the app...
echo Checking for VITE_MAPBOX_TOKEN...
call npm run build:check
if errorlevel 1 (
    echo.
    echo ❌ Build failed! VITE_MAPBOX_TOKEN is required.
    echo.
    echo Please create a .env file with your Mapbox token:
    echo   1. Copy .env.example to .env
    echo   2. Edit .env and add your VITE_MAPBOX_TOKEN
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo 📤 Deploying to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=quakeweather --branch=main
if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo 🌐 Your app: https://hesam.me/quakeweather/
echo.
pause

