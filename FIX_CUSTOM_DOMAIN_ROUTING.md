# Fix Custom Domain Routing: hesam.me/quakeweather/

## 🚨 Problem

The custom domain `https://hesam.me/quakeweather/` is serving an **old build** (`index-CSBluatQ.js`) without the embedded Mapbox token, while:
- ✅ Direct Pages URLs work: `https://main.quakeweather.pages.dev/` and `https://e7ce9c66.quakeweather.pages.dev/`
- ✅ Local build has the token embedded: `index-u8v2K9Y_.js`

## 🔍 Root Cause

The custom domain `hesam.me/quakeweather/` is **not pointing to the latest deployment**. Since you mentioned "there is nothing to change for deployment" in the Cloudflare Pages dashboard, this means:

**The custom domain is configured via a Cloudflare Worker or Page Rule in the `hesam.me` zone**, not directly in the Cloudflare Pages dashboard.

## ✅ Solution: Update Worker/Page Rule

### Step 1: Find the Worker or Page Rule

1. **Go to Cloudflare Dashboard for `hesam.me` domain**:
   - Navigate to: https://dash.cloudflare.com
   - Select the **`hesam.me`** zone (not the `quakeweather` Pages project)

2. **Check Workers**:
   - Go to **Workers & Pages** → **Workers**
   - Look for any Worker that handles `/quakeweather/*` routing
   - Common names: `hesam-routing`, `quakeweather-proxy`, `pages-proxy`, etc.

3. **Check Page Rules**:
   - Go to **Rules** → **Page Rules**
   - Look for any rule matching `/quakeweather/*`
   - Check if it forwards to a specific deployment URL

### Step 2: Update the Worker/Page Rule

#### If Using a Worker:

1. **Click on the Worker** that handles `/quakeweather/*`
2. **Edit the Worker code** and find the line that sets the Pages URL
3. **Update it to point to the latest deployment**:
   ```javascript
   // OLD (pointing to old deployment):
   const PAGES_URL = 'https://8086359b.quakeweather.pages.dev';
   // or
   const PAGES_URL = 'https://e7ce9c66.quakeweather.pages.dev';
   
   // NEW (point to main alias - always latest):
   const PAGES_URL = 'https://main.quakeweather.pages.dev';
   // OR point to specific latest deployment:
   const PAGES_URL = 'https://1fc0a156.quakeweather.pages.dev';
   ```

4. **Deploy the Worker**

#### If Using a Page Rule:

1. **Click on the Page Rule** for `/quakeweather/*`
2. **Edit the forwarding URL**:
   - **OLD**: `https://8086359b.quakeweather.pages.dev` (or old deployment)
   - **NEW**: `https://main.quakeweather.pages.dev` (always latest)
   - **OR**: `https://1fc0a156.quakeweather.pages.dev` (specific latest deployment)

3. **Save the rule**

### Step 3: Wait for Propagation

- **Worker changes**: Usually instant, but wait 1-2 minutes
- **Page Rule changes**: Can take 1-5 minutes to propagate

### Step 4: Clear Caches

1. **Cloudflare Cache**:
   - Go to **Caching** → **Configuration**
   - Click **"Purge Everything"**
   - Or **"Purge by Single URL"**: `https://hesam.me/quakeweather/`

2. **Browser Cache**:
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Or open in **Incognito/Private window**

### Step 5: Verify

1. **Visit**: `https://hesam.me/quakeweather/`
2. **Open DevTools (F12)** → **Network tab**
3. **Check the JavaScript file** being loaded:
   - ✅ **Correct**: `index-u8v2K9Y_.js` (new build with token)
   - ❌ **Wrong**: `index-CSBluatQ.js` (old build without token)
4. **Check Console tab**:
   - ✅ **Should NOT see**: "VITE_MAPBOX_TOKEN environment variable is required"
   - ✅ **Should see**: Map loads correctly

## 🔧 Alternative: Use Cloudflare Pages Custom Domain (Recommended)

If you want to manage the custom domain directly in Cloudflare Pages (easier):

1. **Go to Cloudflare Pages Dashboard**:
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/domains

2. **Remove the Worker/Page Rule** for `/quakeweather/*` in the `hesam.me` zone

3. **Add Custom Domain in Pages**:
   - Click **"Set up a custom domain"**
   - Enter: `hesam.me`
   - Select **"Path-based routing"**
   - Enter path: `/quakeweather`
   - Click **"Save"**

4. **Wait for DNS propagation** (1-5 minutes)

5. **Test**: Visit `https://hesam.me/quakeweather/`

This way, Cloudflare Pages will automatically route the custom domain to the latest production deployment, and you won't need to update Workers/Page Rules manually.

## 📋 Quick Diagnostic

Run this to check what each URL is serving:

```bash
node scripts/check-custom-domain-routing.mjs
```

This will show:
- Which URLs have the token embedded
- Which URLs are serving the old build
- Which URLs are serving the new build

## 🎯 Summary

| URL | Status | Action Needed |
|-----|--------|---------------|
| `https://main.quakeweather.pages.dev/` | ✅ Works | None |
| `https://1fc0a156.quakeweather.pages.dev/` | ✅ Works | None |
| `https://hesam.me/quakeweather/` | ❌ Error | **Update Worker/Page Rule** |

**The fix is to update the Worker or Page Rule in the `hesam.me` zone to point to `https://main.quakeweather.pages.dev` (or the latest deployment).**

## 🆘 If Still Not Working

1. **Verify the Worker/Page Rule was updated correctly**
2. **Check if there are multiple Workers/Page Rules** that might conflict
3. **Wait longer** for DNS/cache propagation (up to 5 minutes)
4. **Try in incognito/private window** to avoid browser cache
5. **Check Cloudflare logs** for any routing errors

