# 🚨 Quick Fix: VITE_MAPBOX_TOKEN Error

## The Problem

You're getting this error because:
- You're building locally (`npm run build`)
- Vite needs `VITE_MAPBOX_TOKEN` during the build
- Cloudflare dashboard variables are NOT available during local builds
- The deployed `dist` folder was built without the token

## ✅ The Fix (3 Steps)

### Step 1: Create .env File

```powershell
# Copy .env.example to .env
Copy-Item .env.example .env
```

### Step 2: Edit .env File and Add Your Token

Open `.env` in your editor and replace `your_mapbox_public_token_here` with your actual Mapbox token:

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...your_actual_token
```

Get your token from: https://account.mapbox.com/access-tokens/

### Step 3: Rebuild and Redeploy

```powershell
# Rebuild (Vite will load .env automatically)
npm run build

# Deploy
npm run pages:deploy
```

## ✅ That's It!

After redeploying, the error should be gone and the map should load.

## 🔍 Why This Works

- Vite automatically loads `.env` files during build
- The token gets embedded in the JavaScript bundle
- The deployed files will have the token
- The error disappears

## 📝 Notes

- `.env` file is gitignored (won't be committed)
- Mapbox tokens are public (safe to expose in client code)
- This is the standard way to handle Vite environment variables

