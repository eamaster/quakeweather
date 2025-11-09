# How to Redeploy After Adding Environment Variables

After setting environment variables in Cloudflare Pages, you **must redeploy** for them to take effect. Environment variables are only applied to **new builds**.

## Option 1: Redeploy via Cloudflare Pages Dashboard (Recommended)

This is the easiest method and doesn't require local setup.

### Steps:

1. **Go to Cloudflare Pages Dashboard**
   - Navigate to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
   - Click on **"Deployments"** tab

2. **Retry the Latest Deployment**
   - Find the most recent deployment in the list
   - Click the **three dots (⋯)** menu on the right side of the deployment
   - Select **"Retry deployment"**
   - This will rebuild the project with the new environment variables

3. **OR Create a New Deployment**
   - Click the **"Create deployment"** button (top right)
   - Select your branch (usually `main`)
   - Click **"Deploy"**
   - This will trigger a new build with the environment variables

4. **Wait for Deployment to Complete**
   - Watch the deployment status in the dashboard
   - The build should complete successfully
   - Once deployed, the new build will have access to the environment variables

5. **Verify the Deployment**
   - Visit `https://hesam.me/quakeweather/`
   - Open browser DevTools (F12)
   - Check Console tab - the Mapbox token error should be gone
   - The map should load correctly

## Option 2: Redeploy via Command Line (Local)

If you prefer to deploy from your local machine, use these commands.

### Steps:

1. **Navigate to Project Directory**
   ```bash
   cd C:\Users\EAMASTER\quakeweather
   ```

2. **Rebuild the Project**
   ```bash
   npm run build
   ```
   This will create a new `dist` folder with the latest code.

3. **Deploy to Cloudflare Pages**
   ```bash
   npm run pages:deploy
   ```
   
   OR use the full command:
   ```bash
   npx wrangler pages deploy dist --project-name=quakeweather --branch=main
   ```

4. **Wait for Deployment**
   - Wrangler will upload the files and deploy
   - You'll see the deployment URL in the output
   - The deployment will use the environment variables set in the Cloudflare dashboard

5. **Verify the Deployment**
   - Visit `https://hesam.me/quakeweather/`
   - Test that the app works correctly

### Quick Deploy Script (Windows)

You can also use the provided deploy script:

```bash
deploy.bat
```

This script will:
1. Build the project (`npm run build`)
2. Deploy to Cloudflare Pages (`npx wrangler pages deploy dist`)
3. Show the deployment URL

## Option 3: Trigger Deployment via Git Push

If your project is connected to a Git repository, you can trigger a deployment by pushing a commit.

### Steps:

1. **Make a Small Change** (optional)
   - You can make a trivial change like updating a comment or README
   - Or just commit any pending changes

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "chore: trigger redeploy with environment variables"
   git push origin main
   ```

3. **Cloudflare Pages will Automatically Deploy**
   - If you have Git integration enabled, Cloudflare Pages will automatically build and deploy
   - The build will use the environment variables set in the dashboard
   - Check the "Deployments" tab to see the new deployment

## Important Notes

### Environment Variables Are Applied at Build Time
- **Build-time variables** (like `VITE_MAPBOX_TOKEN`) are injected during the build process
- **Runtime variables** (like `OPENWEATHER_API_KEY`) are available in Pages Functions at runtime
- Both types are applied when you deploy, but build-time variables must be set before the build starts

### Build-Time vs Runtime Variables

| Variable | When Applied | When Available |
|----------|--------------|----------------|
| `VITE_MAPBOX_TOKEN` | During build | In client-side code (bundle) |
| `OPENWEATHER_API_KEY` | During deployment | In Pages Functions (runtime) |
| `COHERE_API_KEY` | During deployment | In Pages Functions (runtime) |

### Verification Steps

After redeploying, verify that:

1. ✅ The deployment completed successfully (check Cloudflare Pages dashboard)
2. ✅ The build logs show no errors related to environment variables
3. ✅ The app loads at `https://hesam.me/quakeweather/`
4. ✅ No Mapbox token error in browser console
5. ✅ The map renders correctly
6. ✅ API calls work (test weather/earthquake data loading)

## Troubleshooting

### Deployment Still Shows Old Behavior

**Possible causes**:
1. Environment variables not set correctly in dashboard
2. Variables not marked as "Available during build" (for `VITE_MAPBOX_TOKEN`)
3. Cache issues (browser or CDN cache)

**Solutions**:
1. Verify environment variables are set in the dashboard
2. Check that `VITE_MAPBOX_TOKEN` is marked as "Available during build"
3. Clear browser cache (Ctrl+Shift+R for hard refresh)
4. Wait a few minutes for CDN cache to clear
5. Check build logs in Cloudflare Pages dashboard

### Build Fails

**Possible causes**:
1. Invalid environment variable values
2. Missing required variables
3. Build command issues

**Solutions**:
1. Check build logs in Cloudflare Pages dashboard
2. Verify all environment variables are set correctly
3. Ensure `VITE_MAPBOX_TOKEN` is available during build
4. Try redeploying again

### Environment Variables Not Available

**Possible causes**:
1. Variables not set for the correct environment (Production vs Preview)
2. Variables not saved correctly
3. Deployment not triggered after setting variables

**Solutions**:
1. Verify variables are set for "Production" environment
2. Double-check variable names (case-sensitive)
3. Ensure you redeployed after setting variables
4. Check variable values are correct (no extra spaces, etc.)

## Quick Reference

### Dashboard Method (Easiest)
1. Go to Deployments tab
2. Click "Retry deployment" on latest deployment
3. Wait for build to complete
4. Test the app

### Command Line Method
```bash
npm run build
npm run pages:deploy
```

### Git Push Method
```bash
git commit -m "chore: trigger redeploy"
git push origin main
```

## Next Steps

After redeploying:

1. ✅ Verify the deployment completed successfully
2. ✅ Test the app at `https://hesam.me/quakeweather/`
3. ✅ Check browser console for errors
4. ✅ Verify the map loads correctly
5. ✅ Test API endpoints (weather, earthquakes, etc.)

If everything works, you're done! If not, check the troubleshooting section above.

