# Custom Domain 404 Fix Guide

## 🔍 Problem

The custom domain `https://hesam.me/quakeweather/` is returning **404 Not Found**, while the Cloudflare Pages deployment is working correctly.

## ✅ Current Status

- ✅ **Production Deployment**: `7f5885dd` (Production branch) - **VERIFIED**
- ✅ **Build**: Successful with correct `/quakeweather/` base path
- ✅ **Assets**: Correctly built with `/quakeweather/assets/...` paths
- ❌ **Custom Domain**: Returns 404 - **NOT CONFIGURED**

## 🎯 Root Cause

The custom domain `hesam.me/quakeweather/` is **not configured** in Cloudflare. This is a **Cloudflare Dashboard configuration issue**, not a code issue.

## 🔧 Solution: Configure Custom Domain in Cloudflare

### Option 1: Configure in Cloudflare Pages Dashboard (Recommended)

1. **Go to Cloudflare Pages Dashboard**:
   - Navigate to: https://dash.cloudflare.com
   - Go to: **Workers & Pages** → **Pages** → **quakeweather**

2. **Add Custom Domain**:
   - Click on **Custom domains** tab
   - Click **"Set up a custom domain"**
   - Enter: `hesam.me`
   - Select **"Path-based routing"**
   - Enter path: `/quakeweather`
   - Click **"Save"**

3. **Wait for DNS Propagation** (2-5 minutes)

4. **Test**: Visit `https://hesam.me/quakeweather/`

### Option 2: Configure via Cloudflare Worker/Page Rule (If hesam.me is in different zone)

If `hesam.me` is in a different Cloudflare zone:

1. **Go to Cloudflare Dashboard for `hesam.me` zone**:
   - Navigate to: https://dash.cloudflare.com
   - Select the **`hesam.me`** zone (NOT the quakeweather Pages project)

2. **Check for Existing Worker/Page Rule**:
   - **Workers & Pages** → **Workers** (look for Worker routing `/quakeweather/*`)
   - **Rules** → **Page Rules** (look for rule matching `/quakeweather/*`)

3. **Update or Create Worker/Page Rule**:
   - Point to: `https://main.quakeweather.pages.dev` (always latest)
   - OR: `https://7f5885dd.quakeweather.pages.dev` (current deployment)

4. **Wait for Propagation** (2-5 minutes)

5. **Test**: Visit `https://hesam.me/quakeweather/`

## 📋 Verification Steps

After configuring the custom domain:

1. **Run diagnostic script**:
   ```bash
   node scripts/diagnose-custom-domain.mjs
   ```

2. **Check custom domain**:
   ```bash
   npm run verify:domain
   ```

3. **Visit in browser**:
   - Go to: `https://hesam.me/quakeweather/`
   - Open DevTools (F12) → Network tab
   - Verify assets load from `/quakeweather/assets/...`
   - Check Console for errors

## ⚠️ Important Notes

- **This is NOT a GitHub Pages deployment** - it's Cloudflare Pages
- The code is correct - the issue is Cloudflare configuration
- The `_redirects` file is correct and will work once the custom domain is configured
- The build has the correct base path (`/quakeweather/`)

## 🚀 Latest Deployment Info

- **Deployment ID**: `7f5885dd`
- **Environment**: Production
- **Branch**: `quakeweather-production`
- **URL**: https://7f5885dd.quakeweather.pages.dev
- **Status**: ✅ Deployed and verified

## 📞 Need Help?

If the custom domain still doesn't work after configuration:

1. Check Cloudflare DNS settings for `hesam.me`
2. Verify the custom domain is active in Pages dashboard
3. Clear Cloudflare cache: **Caching** → **Configuration** → **Purge Everything**
4. Wait 5-10 minutes for full propagation
5. Test in incognito/private window

