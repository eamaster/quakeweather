# Cloudflare Pages Deployment Guide

Complete setup guide for deploying QuakeWeather to `https://hesam.me/quakeweather`

---

## ✅ Step 1: Configure GitHub Secrets

Your GitHub Actions workflow needs these secrets to deploy automatically:

1. **Go to GitHub Repository Settings:**
   - Navigate to: https://github.com/eamaster/quakeweather/settings/secrets/actions

2. **Add the following secrets:**

   **CLOUDFLARE_API_TOKEN:**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Copy the token and add it as `CLOUDFLARE_API_TOKEN` in GitHub

   **CLOUDFLARE_ACCOUNT_ID:**
   - Your Account ID: `767ce92674d0bd477eef696c995faf16`
   - Add this as `CLOUDFLARE_ACCOUNT_ID` in GitHub

   **OPENWEATHER_API_KEY:**
   - Value: `REMOVED_OPENWEATHER_API_KEY`
   - Add as secret in GitHub

   **MAPBOX_TOKEN:**
   - Value: `REMOVED_MAPBOX_TOKEN`
   - Add as secret in GitHub

---

## ✅ Step 2: Configure Cloudflare Pages Custom Domain

### Option A: Root Path Deployment (Recommended)

If you want: `https://hesam.me/` (root domain)

1. **Go to Cloudflare Pages:**
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

2. **Click "Custom domains" tab**

3. **Click "Set up a custom domain"**

4. **Enter:** `hesam.me`

5. **Cloudflare will automatically add the DNS records**

### Option B: Subdirectory Deployment

If you want: `https://hesam.me/quakeweather`

**Important:** Cloudflare Pages **does not support subdirectory paths** directly. You have two options:

#### **Option B1: Use Subdomain (Recommended)**
Deploy to: `https://quakeweather.hesam.me`

1. Go to Cloudflare Pages custom domains
2. Add custom domain: `quakeweather.hesam.me`
3. Cloudflare will auto-configure DNS

#### **Option B2: Use Cloudflare Workers (Advanced)**
Create a Worker to route `hesam.me/quakeweather` → `quakeweather.hesam.me`

---

## ✅ Step 3: Configure Environment Variables in Cloudflare Pages

1. **Go to Cloudflare Pages Settings:**
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

2. **Add these variables for Production:**
   
   | Variable Name | Value |
   |--------------|-------|
   | `OPENWEATHER_API_KEY` | `REMOVED_OPENWEATHER_API_KEY` |
   | `MAPBOX_TOKEN` | `REMOVED_MAPBOX_TOKEN` |

3. **Click "Save"**

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Retry deployment"

---

## ✅ Step 4: Verify Deployment

After setting up GitHub secrets and environment variables:

1. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - https://github.com/eamaster/quakeweather/actions
   - Watch the "Deploy to Cloudflare Pages" workflow

3. **Check Cloudflare Pages:**
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
   - View deployment status

4. **Access your app:**
   - Cloudflare URL: `https://quakeweather.pages.dev`
   - Custom domain: `https://hesam.me` or `https://quakeweather.hesam.me`

---

## 🔧 Recommended Setup for `https://hesam.me/quakeweather`

Since Cloudflare Pages doesn't support subdirectories natively, here's the **best solution**:

### Use Cloudflare Workers to Create Path-Based Routing

1. **Create a new Worker:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/overview
   - Click "Create Worker"
   - Name it: `hesam-me-router`

2. **Add this Worker code:**

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Route /quakeweather to your Cloudflare Pages deployment
    if (url.pathname.startsWith('/quakeweather')) {
      const newUrl = new URL(request.url);
      newUrl.hostname = 'quakeweather.pages.dev';
      newUrl.pathname = url.pathname.replace('/quakeweather', '');
      
      // If pathname becomes empty, set to '/'
      if (newUrl.pathname === '') {
        newUrl.pathname = '/';
      }
      
      return fetch(newUrl, request);
    }
    
    // For other paths, serve your main hesam.me content
    return fetch(request);
  }
}
```

3. **Add Custom Domain to Worker:**
   - Go to Worker settings → Triggers
   - Add custom domain: `hesam.me`

4. **Update DNS:**
   - Ensure `hesam.me` points to your Cloudflare Workers

Now `https://hesam.me/quakeweather` will work! ✅

---

## 🎯 Quick Setup Checklist

- [ ] GitHub Secrets configured (4 secrets)
- [ ] Cloudflare Pages environment variables set (2 variables)
- [ ] Custom domain added in Cloudflare Pages
- [ ] DNS records configured (automatic via Cloudflare)
- [ ] Latest code pushed to GitHub
- [ ] GitHub Actions workflow running successfully
- [ ] App accessible at custom domain

---

## 🐛 Troubleshooting

### Issue: GitHub Actions fails with "pnpm-lock.yaml not found"
**Solution:** ✅ Fixed! We updated the workflow to use npm.

### Issue: 404 on hesam.me/quakeweather
**Solutions:**
1. Use subdomain: `quakeweather.hesam.me` (easiest)
2. Set up Cloudflare Worker routing (see above)
3. Deploy to root: `https://hesam.me` instead

### Issue: API calls fail (401/403 errors)
**Solution:** Make sure environment variables are set in Cloudflare Pages, then redeploy.

### Issue: Map doesn't load
**Solution:** Check MAPBOX_TOKEN is set correctly in Cloudflare environment variables.

---

## 📞 Support

- **Cloudflare Dashboard:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16
- **GitHub Repository:** https://github.com/eamaster/quakeweather
- **Current Deployment:** https://main.quakeweather.pages.dev

---

## 🚀 Recommended Final Configuration

**Best approach for `https://hesam.me/quakeweather`:**

1. ✅ Use subdomain: `https://quakeweather.hesam.me`
2. ✅ Or use Cloudflare Worker for path routing
3. ✅ Avoid GitHub Pages (it's for static sites without server functions)

Your app needs **Cloudflare Pages** (not GitHub Pages) because it has:
- Server-side API routes (`/api/quakes`, `/api/weather`, `/api/insight`)
- Cloudflare Workers integration
- Edge caching
- Environment variables for API keys

---

**Your QuakeWeather app is production-ready! 🎉**

