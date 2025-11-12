# 🗺️ How to Set Mapbox Token in Cloudflare Pages

## Quick Fix for Map Loading Issue

If you see the error: **"Mapbox Token Not Configured"**, follow these steps:

---

## Step-by-Step Instructions

### 1. Get Your Mapbox Token

If you don't have one yet:
1. Go to: https://account.mapbox.com/access-tokens/
2. Sign in or create an account
3. Click **"Create a token"**
4. Copy the token (starts with `pk.eyJ...`)

### 2. Set Environment Variable in Cloudflare Pages

1. **Go to Cloudflare Dashboard:**
   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

2. **Click "Settings" tab** (left sidebar)

3. **Click "Environment variables"** (under Builds & deployments)

4. **Click "Add variable"** button

5. **Fill in the form:**
   - **Variable name:** `VITE_MAPBOX_TOKEN`
   - **Value:** Paste your Mapbox token (from Step 1)
   - **Environment:** Select **"Production"** (or "All environments" if you want it for previews too)

6. **Click "Save"**

### 3. Redeploy Your Site

**Option A: Automatic (if connected to Git)**
- Just push a new commit or wait for the next auto-deploy

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Retry deployment"**

### 4. Verify It Works

1. Wait 1-2 minutes for deployment to complete
2. Visit: https://hesam.me/quakeweather/
3. The map should now load! ✅

---

## Troubleshooting

### Map Still Not Loading?

1. **Check the variable name:**
   - Must be exactly: `VITE_MAPBOX_TOKEN` (case-sensitive)
   - Must start with `VITE_` for Vite to expose it to the client

2. **Check the environment:**
   - Make sure you selected "Production" environment
   - Or select "All environments" to apply to all

3. **Verify the token:**
   - Make sure the token is complete (starts with `pk.eyJ...`)
   - No extra spaces or quotes
   - Token is active in your Mapbox account

4. **Redeploy:**
   - After setting the variable, you MUST redeploy
   - Environment variables are only available at build time

5. **Check browser console:**
   - Open DevTools (F12)
   - Look for any errors
   - The error message should be gone if the token is set correctly

---

## Quick Reference

**Variable Name:** `VITE_MAPBOX_TOKEN`  
**Where to Set:** Cloudflare Pages → Settings → Environment Variables  
**Get Token:** https://account.mapbox.com/access-tokens/  
**After Setting:** Redeploy the Pages project

---

## Why This Happens

Vite (the build tool) only exposes environment variables that start with `VITE_` to the client-side code. This is a security feature to prevent accidentally exposing server-side secrets.

The Map component needs the token at build time to initialize Mapbox GL, so it must be set in Cloudflare Pages before building.

---

**Once you set this, your map will load perfectly!** 🎉

