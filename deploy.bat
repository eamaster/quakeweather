@echo off
REM Quick deploy script for Cloudflare Pages (Windows)

echo 🚀 Building the app...
call npm run build

echo 📤 Deploying to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=quakeweather --branch=main

echo ✅ Deployment complete!
echo 🌐 Your app: https://main.quakeweather.pages.dev
pause

