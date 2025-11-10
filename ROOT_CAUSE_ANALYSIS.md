# Root Cause Analysis: Custom Domain Routing Issue

## 🔍 Investigation Summary

After checking the commit history, codebase, and deployment status, here's what was found:

### ✅ What's Working

1. **Local Build**: 
   - ✅ `.env` file exists with `VITE_MAPBOX_TOKEN` set
   - ✅ Local build (`dist/index.html`) references `index-u8v2K9Y_.js`
   - ✅ Token is embedded in local build JS files

2. **Codebase**:
   - ✅ No hardcoded worker URLs found
   - ✅ No hardcoded deployment URLs found
   - ✅ API calls use relative paths via `getApiUrl()` utility
   - ✅ `functions/[[path]].ts` correctly routes API requests
   - ✅ `vite.config.ts` has correct base path: `base: '/quakeweather/'`

3. **Direct Pages URLs**:
   - ✅ `https://main.quakeweather.pages.dev/` works correctly
   - ✅ `https://0db148a1.quakeweather.pages.dev/` (latest deployment) works correctly

### ❌ What's Broken

1. **Custom Domain**:
   - ❌ `https://hesam.me/quakeweather/` is serving old build (`index-CSBluatQ.js`)
   - ❌ Old build doesn't have the token embedded
   - ❌ Custom domain is pointing to an old deployment

## 🎯 Root Cause

**The custom domain `hesam.me/quakeweather/` is configured via a Cloudflare Worker or Page Rule in the `hesam.me` zone**, not directly in the Cloudflare Pages dashboard.

This Worker/Page Rule is pointing to an **old deployment URL** (likely `https://8086359b.quakeweather.pages.dev/` or similar), which serves the old build without the token.

### Why This Happens

1. **Cloudflare Pages** manages deployments and serves them at `*.pages.dev` URLs
2. **Custom domains** can be configured in two ways:
   - **Directly in Pages** (recommended): Pages automatically routes to latest production deployment
   - **Via Worker/Page Rule** (current setup): Manually configured, needs manual updates

3. **The current setup uses a Worker/Page Rule** that points to a specific deployment URL, which doesn't automatically update when new deployments are made.

## ✅ Solution

### Immediate Fix

1. **Go to Cloudflare Dashboard for `hesam.me` zone**
2. **Find the Worker or Page Rule** that handles `/quakeweather/*`
3. **Update it to point to**: `https://main.quakeweather.pages.dev` (always latest)
4. **Deploy/Save the changes**
5. **Clear Cloudflare cache** for `hesam.me`
6. **Test**: Visit `https://hesam.me/quakeweather/`

### Long-term Fix (Recommended)

1. **Remove the Worker/Page Rule** for `/quakeweather/*` in `hesam.me` zone
2. **Add Custom Domain in Cloudflare Pages**:
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/domains
   - Click "Set up a custom domain"
   - Enter: `hesam.me`
   - Select "Path-based routing"
   - Enter path: `/quakeweather`
   - Save

This way, Pages will automatically route the custom domain to the latest production deployment, and you won't need to manually update Workers/Page Rules.

## 📋 Files Checked

- ✅ `functions/[[path]].ts` - No hardcoded URLs
- ✅ `src/client/utils/api.ts` - Uses relative paths
- ✅ `vite.config.ts` - Correct base path configuration
- ✅ `package.json` - Correct build scripts
- ✅ `Map.tsx` - Correctly reads `import.meta.env.VITE_MAPBOX_TOKEN`
- ✅ `.env` - Token is set
- ✅ `dist/` - Local build has token embedded

## 🔧 Commands Run

```bash
# Checked commit history
git log --oneline --all -20

# Searched for hardcoded URLs
grep -r "https://.*\.pages\.dev" .
grep -r "https://.*\.workers\.dev" .

# Verified local build
npm run build
# Token is embedded ✅

# Deployed latest build
npm run pages:deploy
# New deployment: 0db148a1.quakeweather.pages.dev ✅
```

## 📝 Next Steps

1. **Update Worker/Page Rule** in `hesam.me` zone to point to `https://main.quakeweather.pages.dev`
2. **Clear Cloudflare cache** for `hesam.me`
3. **Test** the custom domain
4. **Consider migrating** to direct Pages custom domain configuration for easier management

## 📚 Related Documentation

- [FIX_CUSTOM_DOMAIN_ROUTING.md](FIX_CUSTOM_DOMAIN_ROUTING.md) - Detailed fix instructions
- [FIX_CUSTOM_DOMAIN.md](FIX_CUSTOM_DOMAIN.md) - Alternative fix methods
- [scripts/check-custom-domain-routing.mjs](scripts/check-custom-domain-routing.mjs) - Diagnostic script

