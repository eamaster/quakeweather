# 🚀 QuakeWeather Setup Guide

## Quick Setup for Cloudflare Deployment

This guide will help you deploy QuakeWeather to Cloudflare Workers and Pages.

---

## Step 1: Get API Keys

### OpenWeather API Key (Required)

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to "API keys" section
4. Copy your API key
5. **Keep this secure** - you'll need it in Step 3

### Mapbox Access Token (Required)

1. Go to https://account.mapbox.com/
2. Sign up or log in
3. Navigate to "Access tokens"
4. Click "Create a token"
5. Copy the token
6. **Keep this secure** - you'll need it in Step 3

### Cohere API Key (Optional)

Only needed for AI explanation feature:

1. Go to https://cohere.com/
2. Sign up for free account
3. Navigate to Dashboard → API Keys
4. Copy your API key
5. **Keep this secure** - you'll need it in Step 3

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Deploy Backend (Cloudflare Worker)

### Set Environment Secrets

```bash
# OpenWeather API Key
npx wrangler secret put OPENWEATHER_API_KEY
# Paste your OpenWeather API key when prompted

# Mapbox Token
npx wrangler secret put MAPBOX_TOKEN
# Paste your Mapbox token when prompted

# Cohere API Key (optional)
npx wrangler secret put COHERE_API_KEY
# Paste your Cohere API key when prompted
```

### Deploy the Worker

```bash
npx wrangler deploy
```

**Result:** Your API will be live at `https://quakeweather-api.smah0085.workers.dev`

**Verify it works:**
```bash
curl https://quakeweather-api.smah0085.workers.dev/api/health
```

You should see a JSON response with `status: "ok"`.

---

## Step 4: Deploy Frontend (Cloudflare Pages)

### Option A: Via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard:**
   https://dash.cloudflare.com/ → Pages → Create a project

2. **Connect to Git:**
   - Click "Connect to Git"
   - Select GitHub
   - Authorize Cloudflare
   - Select your repository
   - Select branch: `main`

3. **Configure Build:**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   Node version: 20
   ```

4. **Add Environment Variable:**
   - Click "Environment variables"
   - Add variable:
     - Name: `VITE_MAPBOX_TOKEN`
     - Value: Your Mapbox token (from Step 1)
     - Environment: Production
   - Click "Save"

5. **Save and Deploy**

6. **Done!** Your app will auto-deploy on every git push.

### Option B: Via Wrangler CLI

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Pages:**
   ```bash
   npx wrangler pages deploy dist --project-name=quakeweather --branch=main
   ```

3. **Set environment variable:**
   - Go to Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables
   - Add: `VITE_MAPBOX_TOKEN` = your_mapbox_token
   - Redeploy

---

## Step 5: Verify Deployment

1. **Visit your app:** `https://quakeweather.pages.dev` (or your custom domain)

2. **Test earthquake map:**
   - You should see earthquake markers
   - Click on a marker
   - Click "Show Weather & Insights"
   - Weather data should load ✅

3. **Check browser console** (F12) for any errors

---

## 🔒 Security Checklist

- [ ] ✅ API keys set using Wrangler secrets (not committed to Git)
- [ ] ✅ `.env` file is gitignored
- [ ] ✅ `.dev.vars` file is gitignored
- [ ] ✅ No credentials in source code
- [ ] ✅ Environment variables set in Cloudflare Pages dashboard
- [ ] ✅ Verified deployment works without exposed credentials

---

## 🐛 Troubleshooting

### Weather API Returns 500 Error

**Cause:** `OPENWEATHER_API_KEY` not set in Cloudflare Worker

**Fix:**
```bash
npx wrangler secret put OPENWEATHER_API_KEY
# Enter your API key
npx wrangler deploy
```

### Map Doesn't Load

**Cause:** `VITE_MAPBOX_TOKEN` not set in Cloudflare Pages

**Fix:**
- Go to Pages → Settings → Environment Variables
- Add `VITE_MAPBOX_TOKEN` with your token
- Redeploy the Pages project

### Build Fails

**Cause:** Missing dependencies or TypeScript errors

**Fix:**
```bash
npm install
npm run type-check
npm run build
```

---

## ✅ You're Done!

Your QuakeWeather app is now deployed and secure! 🎉

**Next steps:**
- Share your app URL with others
- Monitor usage in Cloudflare dashboard
- Keep API keys secure and rotate them if needed

**For more help:**
- See `README.md` for full documentation
- See `HOW_TO_DEPLOY.md` for advanced deployment options
- See `SECURITY.md` for security guidelines

---

**Deployment completed!** Your app is live at: `https://quakeweather.pages.dev` 🚀

