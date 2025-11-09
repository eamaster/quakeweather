@echo off
REM Script to guide setting Cloudflare Pages environment variables (Windows)
REM This script provides instructions for setting environment variables

set PROJECT_NAME=quakeweather
set ACCOUNT_ID=767ce92674d0bd477eef696c995faf16

echo.
echo ========================================
echo   Cloudflare Pages Environment Variables
echo ========================================
echo.
echo Project: %PROJECT_NAME%
echo Account ID: %ACCOUNT_ID%
echo.

echo ⚠️  IMPORTANT: Environment variables MUST be set in the Cloudflare Dashboard
echo    Build-time variables (VITE_*) cannot be set via CLI
echo.

echo ========================================
echo   1. VITE_MAPBOX_TOKEN (REQUIRED)
echo ========================================
echo.
echo This is a BUILD-TIME variable and MUST be set in the dashboard:
echo.
echo Steps:
echo   1. Open: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%/settings/environment-variables
echo   2. Click "Production" environment
echo   3. Click "Add variable"
echo   4. Variable name: VITE_MAPBOX_TOKEN
echo   5. Value: Your Mapbox token (get it from https://account.mapbox.com/access-tokens/)
echo   6. ✅ CHECK "Available during build" (this is crucial!)
echo   7. Click "Save"
echo.
echo ⚠️  CRITICAL: You MUST check "Available during build" for Vite to inject it
echo.
pause
echo.

echo ========================================
echo   2. OPENWEATHER_API_KEY (REQUIRED)
echo ========================================
echo.
echo This is a RUNTIME variable (used in Pages Functions):
echo.
echo Steps:
echo   1. Go to: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%/settings/environment-variables
echo   2. Click "Production" environment
echo   3. Click "Add variable"
echo   4. Variable name: OPENWEATHER_API_KEY
echo   5. Value: Your OpenWeather API key (get it from https://openweathermap.org/api)
echo   6. ❌ DO NOT check "Available during build" (runtime only)
echo   7. Click "Save"
echo.
pause
echo.

echo ========================================
echo   3. COHERE_API_KEY (OPTIONAL)
echo ========================================
echo.
set /p SET_COHERE="Do you want to set COHERE_API_KEY? (y/n): "
if /i "%SET_COHERE%"=="y" (
    echo.
    echo Steps:
    echo   1. Go to: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%/settings/environment-variables
    echo   2. Click "Production" environment
    echo   3. Click "Add variable"
    echo   4. Variable name: COHERE_API_KEY
    echo   5. Value: Your Cohere API key (get it from https://cohere.com/)
    echo   6. ❌ DO NOT check "Available during build" (runtime only)
    echo   7. Click "Save"
    echo.
)
echo.

echo ========================================
echo   ✅ Next Steps
echo ========================================
echo.
echo After setting environment variables, you MUST redeploy:
echo.
echo   1. Go to: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%
echo   2. Click "Deployments" tab
echo   3. Click "Create deployment" or retry the latest deployment
echo   4. Environment variables are only applied to new builds
echo.
echo 🔗 Quick links:
echo    • Environment Variables: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%/settings/environment-variables
echo    • Deployments: https://dash.cloudflare.com/%ACCOUNT_ID%/pages/view/%PROJECT_NAME%/deployments
echo.
pause

