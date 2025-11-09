# Cloudflare Pages Environment Variables Setup

## Issue
The app is loading correctly, but you're seeing this error:
```
Uncaught Error: VITE_MAPBOX_TOKEN environment variable is required. 
Please set it in your .env file or build environment.
```

## Solution: Set Environment Variables in Cloudflare Pages

### Step 1: Access Cloudflare Pages Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click on your project: **quakeweather**

### Step 2: Set Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar
3. You'll see three environments: **Production**, **Preview**, and **Branch previews**

### Step 3: Add Environment Variables for Production
Click on **Production** environment, then add these variables:

#### Required Variables:

1. **VITE_MAPBOX_TOKEN**
   - **Variable name**: `VITE_MAPBOX_TOKEN`
   - **Value**: Your Mapbox public access token
   - **Available during build**: ✅ **YES** (this is crucial for Vite)
   - Get your token from: https://account.mapbox.com/access-tokens/
   - **Note**: This must be marked as available during build for Vite to inject it into the code

2. **OPENWEATHER_API_KEY**
   - **Variable name**: `OPENWEATHER_API_KEY`
   - **Value**: Your OpenWeather API key
   - **Available during build**: ❌ **NO** (this is only needed at runtime in Pages Functions)
   - Get your key from: https://openweathermap.org/api

3. **COHERE_API_KEY** (Optional)
   - **Variable name**: `COHERE_API_KEY`
   - **Value**: Your Cohere API key (only if using AI explanations)
   - **Available during build**: ❌ **NO** (this is only needed at runtime in Pages Functions)
   - Get your key from: https://cohere.com/

### Step 4: Set Environment Variables for Preview (Optional but Recommended)
Repeat the same steps for the **Preview** environment so that preview deployments also work correctly.

### Step 5: Redeploy
After setting the environment variables:

1. **Option A: Trigger a new deployment**
   - Go to **Deployments** tab
   - Click **Create deployment** (or push a new commit to trigger automatic deployment)
   - The build will now have access to `VITE_MAPBOX_TOKEN`

2. **Option B: Retry the latest deployment**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click the three dots (⋯) → **Retry deployment**
   - This will rebuild with the new environment variables

### Step 6: Verify
After deployment:

1. Visit `https://hesam.me/quakeweather/`
2. Open browser DevTools (F12)
3. Check Console tab - the Mapbox token error should be gone
4. The map should load correctly

## Important Notes

### VITE_ Prefix Variables
- Variables with `VITE_` prefix are **injected at build time** by Vite
- They become part of the JavaScript bundle
- They **must** be marked as "Available during build" in Cloudflare Pages
- They are **public** in the client-side code (don't put secrets here!)

### Runtime Variables
- Variables without `VITE_` prefix are only available at runtime in Pages Functions
- They are **not** available in client-side code
- They are **secure** and not exposed to the browser
- Use these for API keys that should remain secret (like `OPENWEATHER_API_KEY`)

### Security Best Practices
- ✅ `VITE_MAPBOX_TOKEN` - Safe to expose (it's a public token with URL restrictions)
- ✅ `OPENWEATHER_API_KEY` - Keep secret (use without VITE_ prefix)
- ✅ `COHERE_API_KEY` - Keep secret (use without VITE_ prefix)

## Troubleshooting

### Error: "VITE_MAPBOX_TOKEN environment variable is required"
**Cause**: The environment variable is not set or not available during build.

**Solution**:
1. Verify the variable is set in Cloudflare Pages dashboard
2. Ensure it's marked as "Available during build"
3. Redeploy the project (environment variables are only applied to new builds)
4. Check the build logs to verify the variable is available

### Map Still Doesn't Load
**Possible causes**:
1. Invalid Mapbox token
2. Token doesn't have the correct scopes
3. Browser cache (try hard refresh: Ctrl+Shift+R)
4. Token URL restrictions (check Mapbox dashboard)

### Build Fails
**Possible causes**:
1. Invalid environment variable syntax
2. Missing required variables
3. Build command issues

Check the build logs in Cloudflare Pages dashboard for specific error messages.

## Quick Reference

### Environment Variables Summary

| Variable | Type | Build Time | Runtime | Purpose |
|----------|------|------------|---------|---------|
| `VITE_MAPBOX_TOKEN` | Public | ✅ Yes | ❌ No | Mapbox map rendering |
| `OPENWEATHER_API_KEY` | Secret | ❌ No | ✅ Yes | Weather API calls |
| `COHERE_API_KEY` | Secret | ❌ No | ✅ Yes | AI explanations |

### Where to Get API Keys

- **Mapbox**: https://account.mapbox.com/access-tokens/
- **OpenWeather**: https://openweathermap.org/api
- **Cohere**: https://cohere.com/

## Next Steps

After setting up the environment variables:

1. ✅ Set `VITE_MAPBOX_TOKEN` in Cloudflare Pages (Production environment)
2. ✅ Set `OPENWEATHER_API_KEY` in Cloudflare Pages (Production environment)
3. ✅ (Optional) Set `COHERE_API_KEY` if using AI features
4. ✅ Redeploy the project
5. ✅ Verify the app works at `https://hesam.me/quakeweather/`

## Support

If you're still having issues:
1. Check the build logs in Cloudflare Pages dashboard
2. Verify environment variables are set correctly
3. Ensure the deployment was successful
4. Clear browser cache and try again

