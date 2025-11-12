# 🔧 Fix Production Deployment - Mapbox Token Issue

## Current Situation

Looking at your Cloudflare Pages deployments:

- **Production:** `7f5885dd.quakeweather.pages.dev` (from `quakeweather-production` branch, a day ago) ❌ Old, no token
- **Latest Main:** `384a46ea.quakeweather.pages.dev` (from `main` branch, 29 minutes ago) ✅ Has error handling, but needs token

**Problem:** Production is serving an old deployment without the Mapbox token.

---

## Solution: Two Options

### Option 1: Promote Latest Main to Production (Recommended - 2 minutes)

This is the fastest way to get the latest code with error handling to production:

1. **Set Environment Variable First:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables
   - Click "Add variable"
   - Name: `VITE_MAPBOX_TOKEN`
   - Value: `REMOVED_MAPBOX_TOKEN`
   - Environment: **All environments** (or Production)
   - Click "Save"

2. **Promote Latest Main Deployment:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments
   - Find the deployment: `384a46ea.quakeweather.pages.dev` (29 minutes ago, from `main` branch)
   - Click the **"..."** menu (three dots) on that deployment
   - Click **"Promote to production"**
   - Confirm

3. **Wait 1-2 minutes** for the promotion to complete

4. **Visit:** https://hesam.me/quakeweather/ - Map should now load! ✅

**Note:** After promoting, you'll need to trigger a new build so the token gets baked in. See Option 2.

---

### Option 2: Trigger New Production Build with Token (3 minutes)

This ensures the token is baked into the production build:

1. **Set Environment Variable:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables
   - Click "Add variable"
   - Name: `VITE_MAPBOX_TOKEN`
   - Value: `REMOVED_MAPBOX_TOKEN`
   - Environment: **Production** (or All environments)
   - Click "Save"

2. **Trigger New Build from Production Branch:**
   
   **If you have `quakeweather-production` branch:**
   ```bash
   # Make sure you're on production branch
   git checkout quakeweather-production
   git merge main  # Merge latest changes
   git push origin quakeweather-production
   ```
   
   **OR trigger a manual build:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments
   - Click "Create deployment" button (top right)
   - Select branch: `quakeweather-production` (or `main` if that's your production branch)
   - Click "Deploy"

3. **Wait 2-3 minutes** for build to complete

4. **Visit:** https://hesam.me/quakeweather/ - Map should load! ✅

---

### Option 3: Quick Fix - Use Main Branch for Production (5 minutes)

If `main` is your actual production branch:

1. **Set Environment Variable:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables
   - Add: `VITE_MAPBOX_TOKEN` = `REMOVED_MAPBOX_TOKEN`
   - Environment: **All environments**
   - Save

2. **Trigger New Build:**
   ```bash
   git commit --allow-empty -m "trigger rebuild with Mapbox token"
   git push origin main
   ```

3. **Wait 2-3 minutes** for automatic deployment

4. **Promote to Production:**
   - Go to Deployments tab
   - Find the new deployment from `main`
   - Click "..." → "Promote to production"

---

## Recommended: Option 1 (Fastest)

**Do this now:**

1. ✅ Set `VITE_MAPBOX_TOKEN` in Cloudflare Pages (1 minute)
2. ✅ Promote `384a46ea` deployment to production (30 seconds)
3. ✅ Wait 1-2 minutes
4. ✅ Test: https://hesam.me/quakeweather/

**Then later:** Trigger a new build so the token is baked in (Option 2 or 3)

---

## Why This Happens

- Vite replaces environment variables **at build time**
- Your production deployment (`7f5885dd`) was built **before** the token was set
- The latest `main` deployment (`384a46ea`) has better error handling but also needs the token
- Setting the env var now will make it available for **future builds**

---

## After Fixing

Once the map loads:
- ✅ Delete `FIX_MAPBOX_TOKEN.md`
- ✅ Delete `SET_MAPBOX_TOKEN_NOW.md`
- ✅ Delete `FIX_PRODUCTION_DEPLOYMENT.md`
- ✅ Delete `DEPLOYMENT_COMPLETE.md`

---

**Do Option 1 now - it's the fastest way to get your map working!** 🗺️

