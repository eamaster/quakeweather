# 🚨 URGENT: Set VITE_MAPBOX_TOKEN in Cloudflare Pages

## The Problem

The custom domain `hesam.me/quakeweather/` is still showing the error because `VITE_MAPBOX_TOKEN` is not set in Cloudflare Pages environment variables.

Even though we built locally with the token, **Cloudflare Pages needs the environment variable set in the dashboard** for it to be available during builds.

---

## ✅ Solution: Set Environment Variable in Cloudflare Pages

### Step 1: Go to Cloudflare Pages Dashboard

1. **Open this URL:**
   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings

2. **Or navigate manually:**
   - Go to: Workers & Pages → quakeweather → **Settings** tab

### Step 2: Add Environment Variable

1. **Scroll down to "Environment Variables" section**

2. **Click "Add variable"** (or "Edit variables" if variables exist)

3. **Add the following:**
   - **Variable name:** `VITE_MAPBOX_TOKEN`
   - **Value:** `REMOVED_MAPBOX_TOKEN`
   - **Environment:** Select **Production** (and optionally Preview)

4. **Click "Save"**

### Step 3: Trigger New Build

After saving the environment variable, you need to trigger a new build:

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click **"Create deployment"** button
3. Select branch: `quakeweather-production`
4. Click **"Deploy"**

**Option B: Via Git (Recommended)**
I'll trigger a new build by pushing a commit to the `quakeweather-production` branch.

---

## 🔄 Alternative: Manual Rebuild & Deploy

If you can't set the env var in the dashboard, I can rebuild and deploy with the token explicitly set:

```bash
# This will be done automatically
$env:VITE_MAPBOX_TOKEN="REMOVED_MAPBOX_TOKEN"
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=quakeweather-production
```

---

## ⚠️ Important Notes

1. **The token must be set in Cloudflare Pages dashboard** for future automatic builds
2. **Current deployment `ac66b7ef` was built locally** - it should have the token, but the custom domain might be serving a cached version
3. **After setting the env var, trigger a new build** to ensure it's included

---

## 🧪 Test After Fix

1. Wait 2-3 minutes after setting the env var and triggering a new build
2. Test: https://ac66b7ef.quakeweather.pages.dev (new deployment)
3. Test: https://quakeweather.pages.dev (production)
4. Test: https://hesam.me/quakeweather/ (custom domain)

**All should work!** ✅

---

**Go to the Settings page now and add the environment variable!**

