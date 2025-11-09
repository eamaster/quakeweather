# Fix: Environment Variables Configuration in Cloudflare Pages

## Current Status (Based on Screenshot)

✅ **VITE_MAPBOX_TOKEN** - Present in "Variables and Secrets"  
✅ **OPENWEATHER_API_KEY** - Present in "Variables and Secrets"  
❌ **COHERE_API_KEY** - Missing (add if using AI features)

## Critical Fix Required

### Issue: VITE_MAPBOX_TOKEN Must Be Available During Build

The `VITE_MAPBOX_TOKEN` is currently set, but you **MUST verify** it's marked as **"Available during build"**.

### Steps to Fix:

1. **Go to Cloudflare Pages Dashboard**
   - Navigate to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
   - Click **Settings** → **Variables and Secrets**
   - Select **Production** environment from the dropdown

2. **Check VITE_MAPBOX_TOKEN Configuration**
   - Find `VITE_MAPBOX_TOKEN` in the list
   - Click the **Edit** icon (pencil icon) next to it
   - **CRITICAL**: Verify that **"Available during build"** is **CHECKED/ENABLED**
   - If it's not checked, check it and save
   - If you can't see this option, the variable might need to be recreated

3. **Verify OPENWEATHER_API_KEY Configuration**
   - Find `OPENWEATHER_API_KEY` in the list
   - Click the **Edit** icon
   - **IMPORTANT**: Ensure **"Available during build"** is **UNCHECKED/DISABLED**
   - This variable should ONLY be available at runtime in Pages Functions
   - Save the changes

4. **Add COHERE_API_KEY (If Using AI Features)**
   - Click **"+ Add"** button
   - **Variable name**: `COHERE_API_KEY`
   - **Value**: Your Cohere API key
   - **Type**: Secret
   - **Available during build**: ❌ **UNCHECKED** (runtime only)
   - Click **Save**

5. **Redeploy the Project**
   - Go to **Deployments** tab
   - Click **"Create deployment"** or retry the latest deployment
   - This is required because build-time variables are only applied to new builds

## Configuration Summary

| Variable | Location | Available During Build | Available at Runtime | Status |
|----------|----------|----------------------|---------------------|--------|
| `VITE_MAPBOX_TOKEN` | Variables and Secrets | ✅ **YES** (Required) | ❌ No | ⚠️ Verify setting |
| `OPENWEATHER_API_KEY` | Variables and Secrets | ❌ **NO** | ✅ Yes | ⚠️ Verify setting |
| `COHERE_API_KEY` | Variables and Secrets | ❌ **NO** | ✅ Yes | ❌ Add if needed |

## Why This Matters

### VITE_MAPBOX_TOKEN (Build-Time)
- **Must be available during build** because Vite needs to inject it into the JavaScript bundle at build time
- If it's not available during build, the error `VITE_MAPBOX_TOKEN environment variable is required` will occur
- The value is embedded in the client-side code (this is safe for Mapbox public tokens)

### OPENWEATHER_API_KEY (Runtime Only)
- **Should NOT be available during build** because it's only used in Pages Functions at runtime
- If it's available during build, it's unnecessary but not harmful
- However, it's a security best practice to only expose it at runtime

### COHERE_API_KEY (Runtime Only)
- **Should NOT be available during build** (same as OPENWEATHER_API_KEY)
- Only needed if you're using AI explanation features
- Add it if the app uses `/api/explain` endpoint

## Verification Steps

After making the changes:

1. **Redeploy the project**
2. **Check build logs** in Cloudflare Pages dashboard
   - The build should complete successfully
   - `VITE_MAPBOX_TOKEN` should be available during the build process
3. **Test the application**
   - Visit `https://hesam.me/quakeweather/`
   - Open browser DevTools (F12)
   - Check Console tab - the Mapbox token error should be gone
   - The map should load correctly

## Troubleshooting

### Error: "VITE_MAPBOX_TOKEN environment variable is required"
**Cause**: The variable is not available during build.

**Solution**:
1. Verify `VITE_MAPBOX_TOKEN` is set in "Variables and Secrets"
2. Ensure "Available during build" is **ENABLED** for this variable
3. Redeploy the project (environment variables are only applied to new builds)
4. Check build logs to confirm the variable is available

### Build Still Fails
**Possible causes**:
1. Variable not marked as "Available during build"
2. Invalid token value
3. Build process not reading the variable correctly

**Solution**:
1. Double-check the variable configuration
2. Try recreating the variable if the option isn't visible
3. Check Cloudflare Pages documentation for the latest variable configuration options

## Alternative: Using Wrangler CLI

If the dashboard doesn't show the "Available during build" option clearly, you can also set variables via Wrangler CLI:

```bash
# Set build-time variable (for Vite)
npx wrangler pages secret put VITE_MAPBOX_TOKEN --project-name=quakeweather

# Set runtime-only variables (for Pages Functions)
npx wrangler pages secret put OPENWEATHER_API_KEY --project-name=quakeweather
npx wrangler pages secret put COHERE_API_KEY --project-name=quakeweather
```

However, the CLI might not distinguish between build-time and runtime variables. The dashboard is the recommended approach.

## Next Steps

1. ✅ Verify `VITE_MAPBOX_TOKEN` is marked as "Available during build"
2. ✅ Verify `OPENWEATHER_API_KEY` is NOT marked as "Available during build"
3. ✅ Add `COHERE_API_KEY` if needed (not marked as "Available during build")
4. ✅ Redeploy the project
5. ✅ Test the application

## References

- Cloudflare Pages Environment Variables: https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
- Vite Environment Variables: https://vitejs.dev/guide/env-and-mode.html

