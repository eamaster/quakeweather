# Cloudflare Pages Direct Setup (Recommended)

✅ **This is the BEST way to deploy** - No GitHub Actions, No GitHub Secrets needed!

Cloudflare Pages connects directly to your GitHub repository and deploys automatically on every push.

---

## 🚀 Step-by-Step Setup

### Step 1: Connect GitHub Repository to Cloudflare Pages

1. **Go to Cloudflare Pages:**
   - https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages

2. **Click "Create a project"** (or "Connect to Git" if you see that)

3. **Connect to GitHub:**
   - Click **"Connect to Git"**
   - Click **"Connect GitHub"**
   - Authorize Cloudflare to access your GitHub account
   - Select the **"eamaster"** account
   - Select the **"quakeweather"** repository

4. **Configure Build Settings:**
   ```
   Project name: quakeweather
   Production branch: main
   
   Build settings:
   Framework preset: None (or Vite)
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   ```

5. **Environment Variables (IMPORTANT!):**
   
   Click **"Add environment variable"** and add these TWO variables:
   
   | Variable name | Value |
   |--------------|--------|
   | `OPENWEATHER_API_KEY` | `REMOVED_OPENWEATHER_API_KEY` |
   | `MAPBOX_TOKEN` | `REMOVED_MAPBOX_TOKEN` |

6. **Click "Save and Deploy"**

---

## ✅ What Happens Now?

- ✅ **Automatic deployments:** Every push to `main` branch triggers automatic deployment
- ✅ **Preview deployments:** Every pull request gets a preview URL
- ✅ **No GitHub Secrets needed:** Everything managed in Cloudflare dashboard
- ✅ **Pages Functions work automatically:** Your API routes in `/functions` folder are deployed as Cloudflare Workers

---

## 🎯 Your Deployment URLs

After setup, you'll get:

- **Production:** `https://quakeweather.pages.dev`
- **Branch deployments:** `https://main.quakeweather.pages.dev`
- **PR previews:** `https://pr-123.quakeweather.pages.dev`

---

## 🌐 Setup Custom Domain: `hesam.me/quakeweather`

### Option 1: Subdomain (Easiest) ⭐ **RECOMMENDED**

Deploy to: **`https://quakeweather.hesam.me`**

1. **In Cloudflare Pages project settings:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather
   - Click **"Custom domains"** tab
   - Click **"Set up a custom domain"**
   - Enter: `quakeweather.hesam.me`
   - Click **"Continue"**
   - Cloudflare will automatically configure DNS ✅

2. **Done!** Your app will be live at: `https://quakeweather.hesam.me`

### Option 2: Subdirectory Path (Advanced)

To use: **`https://hesam.me/quakeweather`**

Cloudflare Pages doesn't support subdirectory paths natively. You need a Worker:

1. **Create a Cloudflare Worker:**
   - Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers
   - Click **"Create Worker"**
   - Name it: `hesam-router`

2. **Add this code:**

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route /quakeweather to Cloudflare Pages
    if (url.pathname.startsWith('/quakeweather')) {
      // Remove /quakeweather prefix
      const newPath = url.pathname.replace('/quakeweather', '') || '/';
      const newUrl = new URL(newPath + url.search, 'https://quakeweather.pages.dev');
      
      // Forward the request
      const response = await fetch(newUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      // Return response with rewritten headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    
    // For other paths, pass through or serve your main site
    return fetch(request);
  }
}
```

3. **Deploy the Worker**

4. **Add Custom Domain to Worker:**
   - In Worker settings → **Triggers**
   - Add route: `hesam.me/quakeweather*`
   - Or add custom domain: `hesam.me`

Now `https://hesam.me/quakeweather` will work! ✅

---

## 🔄 How Auto-Deployment Works

```
You push code to GitHub
         ↓
Cloudflare detects the push
         ↓
Runs: npm run build
         ↓
Deploys to Pages + Workers
         ↓
Your app is live! 🎉
```

**No GitHub Actions, No Secrets, No Configuration!**

---

## ⚙️ Managing Environment Variables

You can update environment variables anytime:

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

2. Add/Edit variables:
   - `OPENWEATHER_API_KEY`
   - `MAPBOX_TOKEN`

3. **After changing variables:** Redeploy
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Retry deployment"**

---

## 🐛 Troubleshooting

### Issue: Build fails with "Cannot find module"
**Solution:** 
- Check that `package.json` and `package-lock.json` are in the repository
- Make sure build command is: `npm run build`

### Issue: API routes return 404
**Solution:**
- Check that `/functions` folder is in the repository
- Ensure `wrangler.toml` has: `pages_build_output_dir = "dist"`
- Functions should work automatically - no extra config needed

### Issue: Environment variables not working
**Solution:**
- Variables must be set in Cloudflare Pages dashboard (not GitHub)
- After adding variables, trigger a new deployment
- Variables are only available to Pages Functions, not the build process

---

## 📊 Comparison: Direct vs GitHub Actions

| Feature | Direct Cloudflare | GitHub Actions |
|---------|------------------|----------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐ Complex |
| **Secrets Management** | ✅ In Cloudflare | ❌ Need GitHub Secrets |
| **Preview Deployments** | ✅ Automatic | ❌ Manual config |
| **Rollback** | ✅ Easy (one click) | ⭐⭐ Manual |
| **Build Logs** | ✅ In Cloudflare | ✅ In GitHub |
| **Deployment Speed** | ⚡ Fast | ⚡ Fast |

**Winner:** Direct Cloudflare Pages integration! 🏆

---

## ✅ Quick Setup Checklist

- [ ] Go to Cloudflare Pages: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages
- [ ] Click "Create a project" or "Connect to Git"
- [ ] Connect GitHub repository: `eamaster/quakeweather`
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Add environment variables:
  - `OPENWEATHER_API_KEY`
  - `MAPBOX_TOKEN`
- [ ] Click "Save and Deploy"
- [ ] (Optional) Add custom domain: `quakeweather.hesam.me`

---

## 🎯 Why This Is Better

1. **✅ No GitHub Secrets needed** - Everything in Cloudflare
2. **✅ Automatic preview deployments** - Every PR gets its own URL
3. **✅ Easy rollbacks** - One-click rollback in Cloudflare dashboard
4. **✅ Better logs** - Build logs directly in Cloudflare
5. **✅ Pages Functions included** - Your Workers are automatically deployed
6. **✅ Free tier generous** - 500 builds/month, unlimited bandwidth

---

## 🌐 What You're Actually Using

**Cloudflare Pages = Static Hosting + Workers (Functions)**

Your `/functions` folder contains:
- `[[path]].ts` - Catch-all route handler (Hono server)
- `_middleware.ts` - Security headers

These are deployed as **Cloudflare Workers** automatically when you use Pages!

So you ARE using Workers, just through Pages Functions. 🎉

---

**Ready to deploy? Follow the checklist above!** 🚀

