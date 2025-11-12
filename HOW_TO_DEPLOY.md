# 🚀 How to Deploy QuakeWeather

## Deployment Method: Cloudflare Workers + Pages

QuakeWeather uses Cloudflare's edge infrastructure for global performance and scalability.

---

## Prerequisites

1. **Cloudflare Account** - Sign up at [Cloudflare](https://dash.cloudflare.com/)
2. **Wrangler CLI** - Install globally: `npm install -g wrangler`
3. **API Keys**:
   - **OpenWeather**: [Get API key](https://openweathermap.org/api)
   - **Mapbox**: [Get access token](https://account.mapbox.com/)
   - **Cohere** (optional): [Get API key](https://cohere.com/)

---

## 🔧 Deploy Backend (Cloudflare Worker)

### Step 1: Set Environment Secrets

```bash
# OpenWeather API Key (REQUIRED)
npx wrangler secret put OPENWEATHER_API_KEY
# Enter your OpenWeather API key when prompted

# Mapbox Token (REQUIRED)
npx wrangler secret put MAPBOX_TOKEN
# Enter your Mapbox token when prompted

# Cohere API Key (OPTIONAL - for AI explanations)
npx wrangler secret put COHERE_API_KEY
# Enter your Cohere API key when prompted
```

### Step 2: Deploy Worker

```bash
npx wrangler deploy
```

### Step 3: Verify

Your API will be live at: `https://quakeweather-api.smah0085.workers.dev`

Test it:
```bash
curl https://quakeweather-api.smah0085.workers.dev/api/health
```

---

## 🌐 Deploy Frontend (Cloudflare Pages)

### Method 1: Manual Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy dist --project-name=quakeweather --branch=main
   ```

3. **Set environment variable in Cloudflare Pages:**
   - Go to: Pages → Your Project → Settings → Environment Variables
   - Add: `VITE_MAPBOX_TOKEN` = your_mapbox_token_here
   - Save and redeploy

### Method 2: Automatic Deployment (Recommended)

1. **Go to Cloudflare Dashboard:**
   https://dash.cloudflare.com/[your-account-id]/pages

2. **Click "Create a project" or select existing project**

3. **Connect to Git:**
   - Click "Connect to Git"
   - Select GitHub
   - Authorize Cloudflare
   - Select repository: `eamaster/quakeweather`
   - Select branch: `main`

4. **Configure Build Settings:**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   ```

5. **Add Environment Variables:**
   - Click "Environment variables"
   - Add: `VITE_MAPBOX_TOKEN` = your_mapbox_token_here
   - Environment: Production
   - Save

6. **Save and Deploy**

**Result:** Every `git push` to `main` will automatically trigger a deployment!

---

## 🔐 Environment Variables Configuration

### For Workers (Backend API)

Set these using Wrangler CLI:

| Variable | Required | How to Set |
|----------|----------|------------|
| `OPENWEATHER_API_KEY` | ✅ Yes | `npx wrangler secret put OPENWEATHER_API_KEY` |
| `MAPBOX_TOKEN` | ✅ Yes | `npx wrangler secret put MAPBOX_TOKEN` |
| `COHERE_API_KEY` | ⚠️ Optional | `npx wrangler secret put COHERE_API_KEY` |

### For Pages (Frontend)

Set these in Cloudflare Pages dashboard:

| Variable | Required | Where to Set |
|----------|----------|--------------|
| `VITE_MAPBOX_TOKEN` | ✅ Yes | Pages → Settings → Environment Variables |

**Important:** Frontend environment variables must be prefixed with `VITE_` to be accessible in the client code.

---

## 🌐 Your Deployment URLs

After deployment:

- **Backend API**: `https://quakeweather-api.smah0085.workers.dev`
- **Frontend (Pages)**: `https://quakeweather.pages.dev`
- **Custom Domain**: `https://hesam.me/quakeweather` (if configured)

---

## 🔄 Deployment Workflow

### For Regular Updates:

1. Make code changes
2. Test locally (if needed)
3. Commit: `git add . && git commit -m "your message"`
4. Push: `git push origin main`
5. **If auto-deploy is configured**: Deployment happens automatically ✅
6. **If not**: Run `npx wrangler deploy` for backend or `npx wrangler pages deploy dist` for frontend
7. Verify changes at your live URL

---

## 🎯 Custom Domain Setup

### Option 1: Subdomain (quakeweather.yourdomain.com)

1. Go to: Pages → Your Project → Custom domains
2. Click "Set up a custom domain"
3. Enter: `quakeweather.yourdomain.com`
4. Cloudflare automatically configures DNS ✅

### Option 2: Path-based (yourdomain.com/quakeweather)

Requires a Cloudflare Worker for routing. Contact support or see Cloudflare documentation.

---

## 🐛 Troubleshooting

### Build Failed

**Check:**
- Ensure `package.json` and `package-lock.json` are committed
- Verify Node version in build settings (use 20)
- Check build logs in Cloudflare dashboard

### API Returns 500 Errors

**Solution:**
- Environment variables not set in Cloudflare Workers
- Run `npx wrangler secret put <KEY_NAME>` for each required secret
- Redeploy worker

### Map Doesn't Load

**Solution:**
- `VITE_MAPBOX_TOKEN` not set in Cloudflare Pages
- Go to Pages → Settings → Environment Variables
- Add the variable and redeploy

### Weather API Returns 401/403

**Solution:**
- `OPENWEATHER_API_KEY` not set or invalid
- Rotate your API key if exposed
- Set new key with `npx wrangler secret put OPENWEATHER_API_KEY`

---

## 🔒 Security Best Practices

1. **Never commit API keys** to Git
2. **Use `.gitignore`** for `.env` and `.dev.vars` files
3. **Rotate exposed credentials immediately**
4. **Use Wrangler secrets** for production
5. **Review commits** before pushing

---

## 📚 Additional Resources

- **README**: See `README.md` for project overview
- **Contributing**: See `CONTRIBUTING.md` for contribution guidelines
- **Cloudflare Docs**: [Workers](https://developers.cloudflare.com/workers/) | [Pages](https://developers.cloudflare.com/pages/)
- **Wrangler Docs**: [CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

---

**Ready to deploy? Follow the steps above and your app will be live in minutes! 🎉**
