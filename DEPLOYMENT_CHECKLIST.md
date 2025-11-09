# Deployment Checklist for /quakeweather/ Subdirectory

## Issue
The app is deployed at `https://hesam.me/quakeweather/` but assets are returning 404 errors because the HTML being served doesn't have the correct base path.

## Root Cause
The HTML file being served has asset paths like `/assets/...` instead of `/quakeweather/assets/...`, which means either:
1. An old cached HTML file is being served
2. The deployment isn't using the latest build
3. There's a cache layer (CDN/browser) serving stale content

## Solution Steps

### 1. Verify Build Configuration
✅ Vite is configured with `base: '/quakeweather/'` in `vite.config.ts`
✅ The built HTML in `dist/index.html` has paths like `/quakeweather/assets/...`

### 2. Rebuild and Deploy
```bash
# Clean build
rm -rf dist
npm run build

# Verify the built HTML has correct paths
cat dist/index.html | grep "assets"

# Deploy to Cloudflare Pages
npm run pages:deploy
```

### 3. Verify Deployment
After deployment, check:
- [ ] The deployment shows as successful in Cloudflare Pages dashboard
- [ ] The deployment URL (e.g., `https://*.pages.dev`) shows the correct HTML
- [ ] View page source shows `/quakeweather/assets/...` paths

### 4. Clear Caches
- **Browser Cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or clear cache
- **Cloudflare Cache**: In Cloudflare dashboard, purge cache for `hesam.me`
- **CDN Cache**: If using a CDN, purge its cache

### 5. Verify Custom Domain Configuration
In Cloudflare Pages dashboard:
- [ ] Check "Custom domains" tab
- [ ] Verify `hesam.me` is configured correctly
- [ ] Ensure the custom domain points to the latest deployment
- [ ] Check if there are any rewrite rules or proxies that might be serving old content

### 6. Test the Deployment
1. Visit `https://hesam.me/quakeweather/`
2. Open browser DevTools (F12)
3. Check Network tab for asset requests
4. Verify assets are requested from `/quakeweather/assets/...`
5. If assets are requested from `/assets/...`, the HTML is still wrong

### 7. If Issues Persist

#### Option A: Check if hesam.me is a reverse proxy
If `hesam.me` is not directly pointing to Cloudflare Pages but is using a reverse proxy:
- Check the reverse proxy configuration
- Ensure it's not caching the HTML file
- Verify it's forwarding requests correctly to Cloudflare Pages

#### Option B: Verify Cloudflare Pages Configuration
- Check if there's a custom build command that might be overriding the base path
- Verify environment variables are set correctly
- Check if there are any build settings that might affect the output

#### Option C: Check _redirects File
The `_redirects` file should:
- Serve `/quakeweather/` -> `/index.html`
- Rewrite `/quakeweather/assets/*` -> `/assets/*`

But if the HTML doesn't have `/quakeweather/` in paths, the redirects won't help.

## Expected Behavior

### Correct HTML (from build)
```html
<script src="/quakeweather/assets/index-XXX.js"></script>
<link href="/quakeweather/assets/index-XXX.css" rel="stylesheet">
```

### Incorrect HTML (causing 404s)
```html
<script src="/assets/index-XXX.js"></script>
<link href="/assets/index-XXX.css" rel="stylesheet">
```

## Verification Commands

```bash
# Check built HTML
cat dist/index.html | grep -E "(assets|models)"

# Should show paths like:
# /quakeweather/assets/index-XXX.js
# /quakeweather/assets/index-XXX.css
# /quakeweather/models/nowcast.json

# If it shows /assets/... instead, the build is wrong
```

## Next Steps

1. **Rebuild and redeploy** with the latest code
2. **Clear all caches** (browser, Cloudflare, CDN)
3. **Verify the HTML** being served has `/quakeweather/` paths
4. **Check custom domain configuration** in Cloudflare Pages
5. **Test in incognito/private window** to avoid browser cache

If the HTML still doesn't have the correct paths after rebuilding and deploying, there might be a configuration issue with how `hesam.me` is set up or how Cloudflare Pages is serving the files.

