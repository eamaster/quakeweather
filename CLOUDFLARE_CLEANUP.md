# Cloudflare Dashboard Cleanup Guide

## ✅ Service in Use: Cloudflare Pages

**KEEP**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

The project uses **Cloudflare Pages** with Pages Functions for both frontend and API. This is the correct service.

## ❌ Service to Remove: Cloudflare Workers

**DELETE**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/services/view/quakeweather-api/production

The `quakeweather-api` Worker service is no longer needed and should be deleted.

---

## Step-by-Step Cleanup Instructions

### 1. Delete the Worker Service

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/services/view/quakeweather-api/production
2. Click on **Settings** (or the gear icon)
3. Scroll down to **Delete Worker** section
4. Click **Delete** and confirm
5. **Important**: This will permanently delete the Worker service

### 2. Revoke Worker Secrets (if any)

If the Worker had environment variables/secrets:
1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/services/view/quakeweather-api/production
2. Navigate to **Settings** → **Variables and Secrets**
3. Delete any secrets that were only used by the Worker
4. **Note**: Secrets used by Pages should remain in Pages environment variables

### 3. Verify Pages Environment Variables

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
2. Click **Settings** → **Environment Variables**
3. Ensure these are set for **Production** (and **Preview** if needed):
   - `OPENWEATHER_API_KEY` - OpenWeather API key
   - `COHERE_API_KEY` - Cohere API key (optional)
   - `VITE_MAPBOX_TOKEN` - Mapbox token (used at build time)

### 4. Verify Pages Deployment

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
2. Check **Deployments** tab to ensure latest deployment is successful
3. Visit your Pages URL to verify the app works correctly

---

## Why This Change?

- **Simplified Architecture**: Pages Functions handle all API requests via `functions/[[path]].ts`
- **Single Deployment**: One service (Pages) instead of two (Pages + Worker)
- **Lower Cost**: No separate Worker service to maintain
- **Better Integration**: Pages Functions share the same domain as the frontend
- **Easier Maintenance**: All configuration in one place

---

## Verification Checklist

After cleanup, verify:

- [ ] Worker service `quakeweather-api` is deleted
- [ ] Pages service `quakeweather` is active and deployed
- [ ] Environment variables are set in Pages (not Workers)
- [ ] App functions correctly at Pages URL
- [ ] All API endpoints (`/api/*`) work via Pages Functions
- [ ] No references to `*.workers.dev` in codebase

---

## Need Help?

- **Pages Documentation**: https://developers.cloudflare.com/pages/
- **Pages Functions**: https://developers.cloudflare.com/pages/platform/functions/
- **Project README**: See `README.md` for deployment instructions

