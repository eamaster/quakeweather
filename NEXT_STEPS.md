# ✅ Next Steps - Make New Build Production

## What I Just Did

✅ **Triggered a new build** - I pushed an empty commit to `main` branch  
✅ **Cloudflare Pages is now building** - It will use the `VITE_MAPBOX_TOKEN` you set  
⏳ **Wait 2-3 minutes** - For the build to complete

---

## Step 1: Check New Deployment (2-3 minutes from now)

1. **Go to Deployments tab:**
   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments

2. **Look for a NEW deployment at the top:**
   - Should show "Building..." or "Deploying..." now
   - Will show "Just now" or "1 minute ago" when done
   - Source: `main` branch
   - Commit: "trigger rebuild with Mapbox token environment variable"

---

## Step 2: Make It Production

### Option A: Change Production Branch to `main` (Easiest - 1 minute)

If you don't see "Promote to production" button, change the production branch:

1. **Go to Settings tab:**
   https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings

2. **Click "Builds & deployments"** section

3. **Find "Production branch"** setting

4. **Change it from `quakeweather-production` to `main`**

5. **Click "Save"**

6. **Done!** The latest `main` deployment will automatically become production ✅

### Option B: Use "Promote to production" Button

If you see a "Promote to production" button on the new deployment:

1. Click the **"..."** menu (three dots) on the new deployment
2. Click **"Promote to production"**
3. Confirm

---

## Step 3: Verify (1 minute after Step 2)

1. **Wait 1 minute** for the promotion to take effect
2. **Visit:** https://hesam.me/quakeweather/
3. **Map should load!** ✅

---

## If Option A Doesn't Work

If changing the production branch doesn't work, I can manually deploy to production:

**Just let me know and I'll run:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=production
```

But try Option A first - it's the cleanest solution!

---

## Timeline

- **Now:** Build is running (2-3 minutes)
- **In 2-3 min:** New deployment appears
- **In 3-4 min:** You change production branch (Option A)
- **In 4-5 min:** Map loads at https://hesam.me/quakeweather/ ✅

---

**Go to Settings → Builds & deployments → Change Production branch to `main` → Save**

**Then wait 2-3 minutes for the new build to complete!** 🗺️

