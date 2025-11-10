# Fix Custom Domain: hesam.me/quakeweather/

## Problem
The custom domain `https://hesam.me/quakeweather/` is pointing to an **old deployment** without the embedded Mapbox token, while the direct Pages URLs (`https://e7ce9c66.quakeweather.pages.dev/`) work correctly.

## Root Cause
The custom domain is not pointing to the latest deployment (`e7ce9c66`). This is a **Cloudflare configuration issue**, not a code issue.

## Solution: Configure Custom Domain in Cloudflare Dashboard

### Method 1: Configure Custom Domain in Cloudflare Pages (RECOMMENDED)

1. **Go to Cloudflare Pages Dashboard**:
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/domains

2. **Check if `hesam.me` is listed**:
   - If **NOT listed**: Click **"Set up a custom domain"**
     - Enter: `hesam.me`
     - Select **"Path-based routing"**
     - Enter path: `/quakeweather`
     - Click **"Save"**
   - If **IS listed**: Click on the domain
     - Change **"Production deployment"** to: `e7ce9c66`
     - Or click **"Promote to Production"** on the latest deployment

3. **Wait 1-2 minutes** for DNS to propagate

4. **Test**: Visit `https://hesam.me/quakeweather/` and hard refresh (Ctrl+Shift+R)

---

### Method 2: Promote Latest Deployment to Production

1. **Go to Deployments**:
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments

2. **Find deployment**: `e7ce9c66` (or the latest one that works)

3. **Click ⋯ (three dots)** → **"Promote to Production"**

4. **Wait 30-60 seconds** for propagation

5. **Test**: Visit `https://hesam.me/quakeweather/` and hard refresh

---

### Method 3: Use Cloudflare Workers (If hesam.me is a different zone)

If `hesam.me` is in a **different Cloudflare zone** and uses a Worker to route to Pages:

1. **Go to Workers & Pages → Workers**:
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/services

2. **Find the Worker** that handles `hesam.me/quakeweather/*`

3. **Update the Worker code** to point to the latest deployment:
   ```javascript
   // Change from old deployment URL to new one
   const PAGES_URL = 'https://e7ce9c66.quakeweather.pages.dev';
   // Or use the alias:
   const PAGES_URL = 'https://main.quakeweather.pages.dev';
   ```

4. **Deploy the Worker**

5. **Test**: Visit `https://hesam.me/quakeweather/`

---

### Method 4: Check Cloudflare Page Rules

If `hesam.me` uses Page Rules to route to Pages:

1. **Go to Page Rules**:
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/hesam.me/rules/page-rules

2. **Find the rule** for `/quakeweather/*`

3. **Update the forwarding URL** to:
   - `https://e7ce9c66.quakeweather.pages.dev`
   - Or: `https://main.quakeweather.pages.dev`

4. **Save the rule**

5. **Test**: Visit `https://hesam.me/quakeweather/`

---

## Verification Steps

After configuring the custom domain:

1. **Visit**: `https://hesam.me/quakeweather/`
2. **Open DevTools (F12)** → **Network tab**
3. **Check the JavaScript file** being loaded:
   - ✅ **Correct**: `index-u8v2K9Y_.js` (new build with token)
   - ❌ **Wrong**: `index-CSBluatQ.js` (old build without token)

4. **Check Console tab**:
   - ✅ **Should NOT see**: "VITE_MAPBOX_TOKEN environment variable is required"
   - ✅ **Should see**: Map loads correctly

---

## Quick Diagnostic

Run this to check what each URL is serving:

```bash
node scripts/verify-deployment.mjs
```

This will show:
- Which URLs have the token embedded
- Which URLs are serving the old build
- Which URLs are serving the new build

---

## If Still Not Working

### Clear All Caches

1. **Cloudflare Cache**:
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/hesam.me/caching
   - Click **"Purge Everything"**
   - Or **"Purge by Single URL"**: `https://hesam.me/quakeweather/`

2. **Browser Cache**:
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or open in **Incognito/Private window**

3. **Wait 2-3 minutes** for caches to clear

---

## Summary

| URL | Status | Action Needed |
|-----|--------|---------------|
| `https://e7ce9c66.quakeweather.pages.dev/` | ✅ Works | None |
| `https://main.quakeweather.pages.dev/` | ✅ Works | None |
| `https://hesam.me/quakeweather/` | ❌ Error | **Configure custom domain** |

**The fix is to point the custom domain to the latest deployment (`e7ce9c66`) in the Cloudflare dashboard.**

