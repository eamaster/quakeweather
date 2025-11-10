# Redeploy Cloudflare Pages via PowerShell

After setting environment variables in the Cloudflare Pages dashboard, use these PowerShell commands to redeploy.

## Quick Redeploy (One Command)

```powershell
npm run build; npm run pages:deploy
```

## Step-by-Step Redeploy

### 1. Navigate to Project Directory
```powershell
cd C:\Users\EAMASTER\quakeweather
```

### 2. Build the Project
```powershell
npm run build
```
This compiles TypeScript and builds the Vite project into the `dist` folder.

### 3. Deploy to Cloudflare Pages
```powershell
# Deploy to PRODUCTION (custom domain: https://hesam.me/quakeweather/)
npm run pages:deploy:prod

# OR deploy to PREVIEW (https://main.quakeweather.pages.dev/)
npm run pages:deploy:preview
```

**⚠️ IMPORTANT**: Use `pages:deploy:prod` for Production, `pages:deploy:preview` for Preview.

After deploying, verify it went to Production:
```powershell
npm run verify:prod
```

## Complete PowerShell Script

You can create a PowerShell script file (`redeploy.ps1`):

```powershell
# redeploy.ps1
Write-Host "🚀 Building the app..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "📤 Deploying to Cloudflare Pages..." -ForegroundColor Green
    npm run pages:deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment complete!" -ForegroundColor Green
        Write-Host "🌐 Your app: https://hesam.me/quakeweather/" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
```

Run it with:
```powershell
.\redeploy.ps1
```

## Verify Deployment

After deployment, verify it worked:

```powershell
# Open the app in your default browser
Start-Process "https://hesam.me/quakeweather/"
```

## Troubleshooting

### If Build Fails
```powershell
# Check for errors
npm run build

# Verify environment variables are set (for local testing)
# Note: Environment variables are set in Cloudflare dashboard, not locally
```

### If Deployment Fails
```powershell
# Check Wrangler authentication
npx wrangler whoami

# If not logged in, authenticate
npx wrangler login
```

### Check Deployment Status
```powershell
# List recent deployments (if Wrangler supports it)
npx wrangler pages deployment list --project-name=quakeweather
```

## Important Notes

1. **Environment Variables**: These are set in the Cloudflare Pages dashboard, not in your local `.env` file. The deployment will use the variables from the dashboard.

2. **Build Process**: The build runs locally, but the environment variables are injected during the Cloudflare Pages build process. For `VITE_MAPBOX_TOKEN`, it must be marked as "Available during build" in the dashboard.

3. **Authentication**: Make sure you're logged into Wrangler:
   ```powershell
   npx wrangler login
   ```

4. **Project Name**: The project name is `quakeweather` as specified in the deploy command.

## Quick Reference

```powershell
# Full redeploy command
cd C:\Users\EAMASTER\quakeweather; npm run build; npm run pages:deploy
```

## After Deployment

1. Wait for deployment to complete (usually 1-2 minutes)
2. Visit `https://hesam.me/quakeweather/`
3. Check browser console (F12) for any errors
4. Verify the map loads correctly

