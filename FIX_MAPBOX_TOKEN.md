# Fix: VITE_MAPBOX_TOKEN Error - Root Cause and Solution

## 🚨 Root Cause

The error occurs because:

1. **You're using manual deployment** (`wrangler pages deploy dist`)
2. **The build happens locally** with `npm run build`
3. **Vite needs the token during local build** to inject it into the JavaScript bundle
4. **Cloudflare dashboard variables are NOT available during local builds** - they're only available during Cloudflare's build process
5. **The deployed `dist` folder was built without the token**, so the error is baked into the JavaScript

## ✅ Solution: Create Local .env File

Since you're building locally, you need to set the token in a local `.env` file.

### Step 1: Create .env File

**Option A: Use the setup script (Recommended)**
```powershell
.\setup-env.ps1
```

**Option B: Manual creation**
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env

# Then edit .env and replace the placeholder with your actual token
notepad .env
```

### Step 2: Set Your Mapbox Token

Edit the `.env` file and replace `your_mapbox_public_token_here` with your actual Mapbox token:

```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN...your_actual_token
```

Get your token from: https://account.mapbox.com/access-tokens/

### Step 3: Rebuild and Redeploy

```powershell
# Rebuild with the token (Vite will automatically load .env)
npm run build

# Deploy the new build
npm run pages:deploy
```

Or use the deploy script:
```powershell
.\deploy.bat
```

## 🔍 Why This Happens

### Manual Deployment Flow:
```
Local Build (npm run build) 
  → Needs VITE_MAPBOX_TOKEN from .env file
  → Creates dist/ folder with token embedded
  → Deploy dist/ folder (wrangler pages deploy dist)
  → Cloudflare serves the pre-built files
```

### Cloudflare Build Flow (Alternative):
```
Push to Git
  → Cloudflare builds (uses dashboard variables)
  → Creates dist/ folder with token embedded
  → Cloudflare serves the files
```

## ✅ Verification

After rebuilding and redeploying:

1. **Check the built JavaScript** (optional):
   ```powershell
   # Search for the token in the built files (it should be there)
   Select-String -Path "dist/assets/*.js" -Pattern "pk\." | Select-Object -First 1
   ```

2. **Visit the app**:
   - Go to `https://hesam.me/quakeweather/`
   - Open browser DevTools (F12)
   - Check Console - the error should be gone
   - The map should load correctly

## 🔐 Security Note

- The `.env` file is **gitignored** and will not be committed
- The Mapbox token is a **public token** (safe to expose in client code)
- The token gets embedded in the JavaScript bundle (this is expected for Vite)
- Mapbox tokens can have URL restrictions for security

## 📋 Quick Checklist

- [ ] Create `.env` file from `.env.example`
- [ ] Set `VITE_MAPBOX_TOKEN` in `.env` file
- [ ] Rebuild: `npm run build`
- [ ] Verify build succeeded (no errors)
- [ ] Deploy: `npm run pages:deploy`
- [ ] Test: Visit `https://hesam.me/quakeweather/`
- [ ] Verify: Map loads without errors

## 🆘 If It Still Doesn't Work

1. **Verify .env file exists and has the token**:
   ```powershell
   Get-Content .env | Select-String "VITE_MAPBOX_TOKEN"
   ```

2. **Check the token is valid**:
   - Visit https://account.mapbox.com/access-tokens/
   - Verify the token is active
   - Check if there are any URL restrictions

3. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R
   - Or clear cache completely

4. **Check build logs**:
   - Look for any errors during build
   - Verify the token is being loaded

5. **Verify the built files**:
   - Check `dist/assets/*.js` files
   - Search for your token (it should be embedded)

## 🎯 Alternative: Use Cloudflare Pages Build System

If you prefer not to manage local .env files, you can use Cloudflare Pages' build system:

1. **Connect Git repository** to Cloudflare Pages
2. **Set build command**: `npm run build`
3. **Set build output**: `dist`
4. **Set environment variables** in dashboard (you've already done this)
5. **Push to Git** - Cloudflare will build and deploy automatically

This way, Cloudflare's build system will use the dashboard variables, and you don't need a local .env file.

## 📚 Related Documentation

- [ROOT_CAUSE_FIX.md](ROOT_CAUSE_FIX.md) - Detailed explanation of the issue
- [CLOUDFLARE_PAGES_ENV_SETUP.md](CLOUDFLARE_PAGES_ENV_SETUP.md) - Cloudflare dashboard setup
- [HOW_TO_REDEPLOY.md](HOW_TO_REDEPLOY.md) - Redeployment instructions

