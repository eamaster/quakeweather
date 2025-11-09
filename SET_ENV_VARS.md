# Set Environment Variables in Cloudflare Pages

## Quick Setup Guide

### ⚠️ Important Notes

1. **Build-time variables** (like `VITE_MAPBOX_TOKEN`) **MUST** be set in the Cloudflare Dashboard
   - They cannot be set via CLI because they're needed during the build process
   - They **MUST** be marked as "Available during build"

2. **Runtime variables** (like `OPENWEATHER_API_KEY`) can be set via CLI or dashboard
   - They are only needed at runtime in Pages Functions
   - They should **NOT** be marked as "Available during build"

3. **After setting variables, you MUST redeploy** for them to take effect

---

## Method 1: Cloudflare Dashboard (Recommended)

### Step 1: Access Environment Variables

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Click **Production** environment

### Step 2: Set VITE_MAPBOX_TOKEN (Build-Time Variable)

1. Click **Add variable**
2. **Variable name**: `VITE_MAPBOX_TOKEN`
3. **Value**: Your Mapbox public access token
   - Get it from: https://account.mapbox.com/access-tokens/
4. ✅ **CHECK "Available during build"** (this is crucial!)
5. Click **Save**

### Step 3: Set OPENWEATHER_API_KEY (Runtime Variable)

1. Click **Add variable**
2. **Variable name**: `OPENWEATHER_API_KEY`
3. **Value**: Your OpenWeather API key
   - Get it from: https://openweathermap.org/api
4. ❌ **DO NOT check "Available during build"** (runtime only)
5. Click **Save**

### Step 4: Set COHERE_API_KEY (Optional, Runtime Variable)

1. Click **Add variable**
2. **Variable name**: `COHERE_API_KEY`
3. **Value**: Your Cohere API key
   - Get it from: https://cohere.com/
4. ❌ **DO NOT check "Available during build"** (runtime only)
5. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **Create deployment** (or retry the latest deployment)
3. Wait for deployment to complete
4. Environment variables are only applied to new builds

---

## Method 2: Using Scripts (Partial - Runtime Variables Only)

### Windows

```bash
scripts\set-env-vars.bat
```

This script will guide you through setting the variables.

### Linux/Mac

```bash
chmod +x scripts/set-env-vars.sh
./scripts/set-env-vars.sh
```

**Note**: The script can only set runtime variables. Build-time variables (`VITE_MAPBOX_TOKEN`) must be set in the dashboard.

---

## Method 3: Using Wrangler CLI (Runtime Variables Only)

### Set Runtime Secrets

```bash
# Set OPENWEATHER_API_KEY
echo "your_openweather_api_key" | wrangler pages secret put OPENWEATHER_API_KEY --project-name=quakeweather

# Set COHERE_API_KEY (optional)
echo "your_cohere_api_key" | wrangler pages secret put COHERE_API_KEY --project-name=quakeweather
```

### ⚠️ Important: Build-Time Variables Cannot Be Set Via CLI

`VITE_MAPBOX_TOKEN` **cannot** be set via CLI because it's a build-time variable. You **must** set it in the Cloudflare Dashboard and mark it as "Available during build".

---

## Verification

### Check Environment Variables

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables
2. Verify all variables are set for **Production** environment
3. Verify `VITE_MAPBOX_TOKEN` has "Available during build" checked

### Test the Deployment

1. Visit: https://hesam.me/quakeweather/
2. Open browser DevTools (F12)
3. Check Console tab - there should be no Mapbox token errors
4. The map should load correctly

---

## Troubleshooting

### Error: "VITE_MAPBOX_TOKEN environment variable is required"

**Cause**: The variable is not set or not available during build.

**Solution**:
1. Verify the variable is set in Cloudflare Pages dashboard
2. Ensure it's marked as "Available during build"
3. Redeploy the project (environment variables are only applied to new builds)
4. Check the build logs to verify the variable is available

### Variables Set But Not Working

**Possible causes**:
1. Variables were set but deployment wasn't triggered
2. Variables were set for wrong environment (Preview instead of Production)
3. Build-time variable not marked as "Available during build"

**Solution**:
1. Verify variables are set for **Production** environment
2. Trigger a new deployment
3. Check build logs for errors

---

## Quick Reference

### Environment Variables Summary

| Variable | Type | Build Time | Runtime | Set Via |
|----------|------|------------|---------|---------|
| `VITE_MAPBOX_TOKEN` | Public | ✅ Yes | ❌ No | Dashboard only |
| `OPENWEATHER_API_KEY` | Secret | ❌ No | ✅ Yes | Dashboard or CLI |
| `COHERE_API_KEY` | Secret | ❌ No | ✅ Yes | Dashboard or CLI |

### Direct Links

- **Environment Variables**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables
- **Deployments**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments
- **Project Dashboard**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

### API Key Sources

- **Mapbox**: https://account.mapbox.com/access-tokens/
- **OpenWeather**: https://openweathermap.org/api
- **Cohere**: https://cohere.com/

---

## Next Steps

After setting environment variables:

1. ✅ Set `VITE_MAPBOX_TOKEN` in dashboard (mark as "Available during build")
2. ✅ Set `OPENWEATHER_API_KEY` in dashboard or via CLI
3. ✅ (Optional) Set `COHERE_API_KEY` if using AI features
4. ✅ Redeploy the project
5. ✅ Verify the app works at https://hesam.me/quakeweather/

