# 🚀 How to Promote Deployment to Production

## Current Situation

You've set the `VITE_MAPBOX_TOKEN` environment variable ✅  
I've triggered a new build from `main` branch ✅  
Now we need to make it production.

---

## Step 1: Wait for New Build (2-3 minutes)

After I pushed the empty commit, Cloudflare Pages is now building a new deployment with the Mapbox token.

**Check the Deployments tab:**
https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/deployments

You should see a new deployment appearing (status: "Building..." or "Deploying...")

---

## Step 2: Find the New Deployment

Once the build completes (2-3 minutes), you'll see a new deployment at the top of the list:

- **Environment:** Preview (or Production if configured)
- **Source:** `main` branch
- **Deployment:** `xxxxx.quakeweather.pages.dev` (new ID)
- **Status:** "Just now" or "1 minute ago" ✅

---

## Step 3: Promote to Production

### Option A: If "Promote to production" button is visible

1. Find the new deployment (should be at the top)
2. Look for a **"Promote to production"** button or link
3. Click it
4. Confirm the promotion

### Option B: If no "Promote" button (Production branch is different)

If you don't see "Promote to production", it means production is configured to use `quakeweather-production` branch instead of `main`.

**Solution 1: Change Production Branch to `main`**

1. Go to: **Settings** tab
2. Click **"Builds & deployments"**
3. Find **"Production branch"** setting
4. Change it from `quakeweather-production` to `main`
5. Click **"Save"**
6. The latest `main` deployment will automatically become production ✅

**Solution 2: Merge main into production branch**

```bash
git checkout quakeweather-production
git merge main
git push origin quakeweather-production
```

This will trigger a new build from `production` branch with the token.

---

## Step 4: Verify Production

1. Wait 1-2 minutes after promotion/configuration
2. Visit: https://hesam.me/quakeweather/
3. **Map should now load!** ✅

---

## Alternative: Manual Production Deploy

If the above doesn't work, we can manually deploy to production:

```bash
# Build with token (it will use the env var from Cloudflare)
npm run build

# Deploy directly to production
npx wrangler pages deploy dist --project-name=quakeweather --branch=production
```

But first, let's try the automatic way above.

---

## What I Just Did

I pushed an empty commit to trigger a new build. Cloudflare Pages will:
1. ✅ See the `VITE_MAPBOX_TOKEN` environment variable you set
2. ✅ Use it during the build process
3. ✅ Bake it into the JavaScript bundle
4. ✅ Deploy the new version

**Now you just need to make it production!**

---

**Check your Deployments tab in 2-3 minutes and follow Step 3 above!** 🗺️

