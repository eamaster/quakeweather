# 🔧 Quick Fix: Mapbox Token Missing

## Problem

The map at https://hesam.me/quakeweather/ shows a blank page because `VITE_MAPBOX_TOKEN` environment variable is not set in Cloudflare Pages.

**Error:** `VITE_MAPBOX_TOKEN environment variable is not set. Map will not load.`

## Solution (2 minutes)

### Step 1: Get Your Mapbox Token

1. Go to: https://account.mapbox.com/access-tokens/
2. Copy your Mapbox access token (or create a new one)

### Step 2: Set Environment Variable in Cloudflare Pages

1. **Go to Cloudflare Pages Dashboard:**
   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

2. **Click "Add variable"**

3. **Enter:**
   - **Variable name:** `VITE_MAPBOX_TOKEN`
   - **Value:** Your Mapbox token (paste it here)
   - **Environment:** Production (or All environments)

4. **Click "Save"**

### Step 3: Trigger New Build

**Option A: Automatic (if Git connected):**
- Just push any commit to trigger a rebuild
- Or go to Deployments tab → Click "Retry deployment" on latest deployment

**Option B: Manual:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

### Step 4: Verify

1. Wait for deployment to complete (~2-3 minutes)
2. Visit: https://hesam.me/quakeweather/
3. Map should now load! ✅

---

## Why This Happens

Vite replaces environment variables **at build time**, not runtime. So:
- ❌ Setting the env var AFTER building won't work
- ✅ Setting the env var BEFORE building will work
- ✅ Cloudflare Pages uses env vars during the build process

---

## Alternative: Set During Build

If you're deploying manually, you can also set it during build:

```bash
VITE_MAPBOX_TOKEN=your_token_here npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

But the Cloudflare Pages dashboard method is recommended for automatic deployments.

---

**After setting the token and redeploying, your map will load!** 🗺️

