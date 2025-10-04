# 🚀 How to Deploy QuakeWeather

## ✅ Deployment Method: Direct Cloudflare Pages

**GitHub Actions has been removed** - We're using direct Cloudflare Pages deployment instead, which is:
- ✅ Simpler (no GitHub Secrets needed)
- ✅ More reliable (fewer points of failure)
- ✅ Faster (direct deployment)
- ✅ Better integrated (Cloudflare native)

---

## 🎯 Two Ways to Deploy

### Method 1: One-Click Deploy (Windows) ⭐ **EASIEST**

Just double-click the file:
```
deploy.bat
```

That's it! The script will:
1. Build your app
2. Deploy to Cloudflare Pages
3. Show you the live URL

### Method 2: Manual Deploy (Any OS)

Run in terminal:
```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

---

## 🔄 Setup Automatic Deployments (Optional but Recommended)

Want deployments to happen automatically on every `git push`? Set this up once:

### Step 1: Connect GitHub to Cloudflare Pages

1. **Go to:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

2. **Click "Settings" tab** → **"Builds & deployments"**

3. **Click "Connect to Git"** or **"Configure build"**

4. **Connect GitHub:**
   - Click "Connect GitHub account"
   - Authorize Cloudflare
   - Select repository: `eamaster/quakeweather`
   - Branch: `main`

5. **Build Configuration:**
   ```
   Framework preset: None (or Vite)
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   Node version: 20
   ```

6. **Add Environment Variables:**
   
   Click **"Environment variables"** section and add:
   
   | Variable name | Value | Environment |
   |--------------|--------|-------------|
   | `OPENWEATHER_API_KEY` | `REMOVED_OPENWEATHER_API_KEY` | Production |
   | `MAPBOX_TOKEN` | `REMOVED_MAPBOX_TOKEN` | Production |

7. **Click "Save and Deploy"**

✅ **Done!** Now every `git push` will automatically deploy to Cloudflare Pages!

---

## 🌐 Your App URLs

After deployment, your app is available at:

- **Production:** https://quakeweather.pages.dev
- **Branch URL:** https://main.quakeweather.pages.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

---

## ⚙️ Environment Variables (REQUIRED)

Your app **MUST** have these environment variables set in Cloudflare Pages:

1. **Go to:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

2. **Add these 2 variables:**

   **Variable 1: OPENWEATHER_API_KEY**
   - Name: `OPENWEATHER_API_KEY`
   - Value: `REMOVED_OPENWEATHER_API_KEY`
   - Environment: Production
   - Click "Save"

   **Variable 2: MAPBOX_TOKEN**
   - Name: `MAPBOX_TOKEN`
   - Value: `REMOVED_MAPBOX_TOKEN`
   - Environment: Production
   - Click "Save"

3. **Redeploy after adding variables** (run `deploy.bat` or use Method 2)

---

## 🔄 Typical Workflow

### Daily Development:

1. Make code changes
2. Test locally: `npm run dev`
3. Commit changes: `git add . && git commit -m "your message"`
4. Push to GitHub: `git push origin main`
5. Deploy:
   - **If auto-deploy is set up:** Done! ✅ (deploys automatically)
   - **If not:** Run `deploy.bat` or deploy manually

---

## 🌐 Custom Domain Setup

### For `https://quakeweather.hesam.me` (Recommended)

1. **Go to:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/domains

2. **Click "Set up a custom domain"**

3. **Enter:** `quakeweather.hesam.me`

4. **Click "Activate domain"**

5. Cloudflare automatically configures DNS ✅

**Done!** Your app will be live at: `https://quakeweather.hesam.me`

### For `https://hesam.me/quakeweather` (Advanced)

This requires a Cloudflare Worker to handle path routing. See `CLOUDFLARE_DIRECT_SETUP.md` for the Worker code (lines 75-120).

---

## 🐛 Troubleshooting

### Issue: "Build failed"
**Check:** 
- Make sure `package.json` and `package-lock.json` are committed
- Verify build command: `npm run build`
- Check build logs in Cloudflare dashboard

### Issue: "APIs return 401/403 errors"
**Solution:** 
- Environment variables not set in Cloudflare Pages
- Go to settings and add `OPENWEATHER_API_KEY` and `MAPBOX_TOKEN`
- Redeploy after adding variables

### Issue: "Map doesn't load"
**Solution:** 
- `MAPBOX_TOKEN` not set correctly
- Check that the token is set in Cloudflare Pages (not GitHub)
- Make sure you redeployed after adding the variable

### Issue: "GitHub Actions still running/failing"
**Solution:** 
- ✅ **FIXED!** GitHub Actions workflow has been completely removed
- The project now uses direct Cloudflare deployment
- No more GitHub Actions errors!

---

## 📊 Deployment Comparison

| Feature | GitHub Actions | Direct Cloudflare |
|---------|---------------|-------------------|
| Setup complexity | 🟡 Medium | 🟢 Simple |
| Requires GitHub Secrets | ❌ Yes | ✅ No |
| Automatic deploys | ✅ Yes | ✅ Yes (after setup) |
| Manual deploys | ✅ Yes | ✅ Yes |
| Build logs | GitHub | Cloudflare |
| Preview deployments | Need config | ✅ Automatic |
| Rollback | Manual | ✅ One-click |
| **Current method** | ❌ Removed | ✅ **Active** |

---

## ✅ Quick Deployment Checklist

For first-time setup:
- [ ] Environment variables set in Cloudflare Pages
- [ ] Test manual deployment with `deploy.bat`
- [ ] (Optional) Set up automatic deployments from GitHub
- [ ] (Optional) Configure custom domain

For regular deployments:
- [ ] Make your code changes
- [ ] Commit and push to GitHub
- [ ] Deploy (automatic or run `deploy.bat`)
- [ ] Verify at your live URL

---

## 🎯 Why We Don't Use GitHub Actions

Previously, we used GitHub Actions, but we switched to direct Cloudflare deployment because:

1. ❌ **GitHub Actions requires managing secrets in two places** (GitHub + Cloudflare)
2. ❌ **More points of failure** (GitHub API, GitHub runner, Cloudflare API)
3. ❌ **Harder to debug** (logs split between GitHub and Cloudflare)
4. ❌ **No preview deployments by default**

Direct Cloudflare Pages deployment is:

1. ✅ **Everything in one place** (Cloudflare dashboard)
2. ✅ **Native integration** (built for Cloudflare Pages)
3. ✅ **Automatic preview deployments** (every PR gets a URL)
4. ✅ **Simpler troubleshooting** (all logs in one place)
5. ✅ **One-click rollbacks**

---

## 📚 Additional Resources

- **Deployment Status:** See `DEPLOYMENT_STATUS.md`
- **Complete Setup Guide:** See `CLOUDFLARE_DIRECT_SETUP.md`
- **Project Overview:** See `README.md`
- **Cloudflare Dashboard:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages

---

## 🚀 Ready to Deploy?

**Windows users:** Just double-click `deploy.bat` ✅

**Everyone else:** Run `npx wrangler pages deploy dist --project-name=quakeweather --branch=main`

**Need automatic deployments?** Follow the setup guide above (takes 5 minutes)

---

**Your app is ready to go! Happy deploying! 🎉**

