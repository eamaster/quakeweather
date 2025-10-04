# 🛠️ QuakeWeather - Local Development Guide

Complete guide to running QuakeWeather on your local machine for development and testing.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Servers

You need to run **TWO servers** (frontend + backend):

**Terminal 1 - Frontend (React with hot reload):**
```bash
npm run dev
```
This starts at: `http://localhost:5173`

**Terminal 2 - Backend (Cloudflare Functions):**
```bash
npx wrangler pages dev dist --live-reload
```
This starts at: `http://localhost:8787`

### Step 3: Open Your Browser

Go to: **http://localhost:5173**

The frontend will automatically proxy API calls to the backend at `http://localhost:8787`

---

## 🎯 One-Click Development (Windows)

**Just double-click:** `dev.bat`

This will automatically:
1. Start the frontend dev server
2. Start the backend dev server
3. Open both in separate windows

---

## 📋 Development Servers Explained

### Frontend Server (Port 5173)

**What:** Vite development server with hot module replacement (HMR)
**Serves:** React app from `src/client/`
**Features:**
- ⚡ Instant hot reload when you change React components
- 🎨 Live CSS updates
- 🔍 Source maps for debugging
- 🔄 API proxy to backend

**Start with:**
```bash
npm run dev
```

### Backend Server (Port 8787)

**What:** Cloudflare Workers environment (Wrangler)
**Serves:** API functions from `functions/` folder
**Features:**
- 🔧 Simulates Cloudflare Pages Functions
- 🗄️ Access to environment variables from `.dev.vars`
- 🌐 Local Cloudflare Workers runtime

**Start with:**
```bash
npx wrangler pages dev dist --live-reload
```

---

## 🔧 Available npm Scripts

Check your `package.json`:

```bash
npm run dev          # Start Vite dev server (frontend)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run type-check   # Check TypeScript types
```

---

## 🌐 API Routes (Local)

When running locally, your API routes are available at:

- **Quakes:** http://localhost:8787/api/quakes
- **Weather:** http://localhost:8787/api/weather?lat=34.05&lon=-118.25&t=1696377600000
- **Insight:** http://localhost:8787/api/insight (POST)
- **Health:** http://localhost:8787/api/health

**Frontend automatically proxies `/api/*` to the backend** (configured in `vite.config.ts`)

---

## 🔑 Environment Variables

Your environment variables are in `.dev.vars`:

```env
OPENWEATHER_API_KEY=REMOVED_OPENWEATHER_API_KEY
MAPBOX_TOKEN=REMOVED_MAPBOX_TOKEN
```

**Important:**
- ✅ These are loaded automatically by Wrangler
- ✅ Never commit `.dev.vars` to Git (it's in `.gitignore`)
- ✅ Frontend CANNOT access these directly (server-side only)

---

## 📁 Project Structure

```
quakeweather/
├── src/
│   ├── client/              # Frontend (React + TypeScript)
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main app
│   │   ├── main.tsx         # Entry point
│   │   └── styles.css       # Global styles
│   └── server/              # Backend types and utilities
│       ├── routes/          # API route handlers
│       └── lib/             # Utilities, caching, etc.
├── functions/               # Cloudflare Pages Functions
│   ├── [[path]].ts          # Catch-all route (Hono server)
│   └── _middleware.ts       # Security headers
├── public/                  # Static assets
├── dist/                    # Built files (generated)
└── .dev.vars               # Local environment variables
```

---

## 🔄 Development Workflow

### Making Changes to Frontend:

1. Edit files in `src/client/`
2. Save (Ctrl+S)
3. Browser automatically reloads ⚡
4. No need to restart server

### Making Changes to Backend:

1. Edit files in `functions/` or `src/server/`
2. Save (Ctrl+S)
3. Wrangler automatically reloads 🔄
4. API changes take effect immediately

### Making Changes to Styles:

1. Edit `src/client/styles.css` or component styles
2. Save (Ctrl+S)
3. Styles update instantly without page reload ✨

---

## 🐛 Debugging

### Frontend Debugging

**Browser DevTools:**
- Open Chrome/Edge DevTools (F12)
- Go to Sources tab
- Files are in `webpack://` or source maps
- Set breakpoints directly in TypeScript files

**React DevTools:**
- Install React DevTools extension
- Inspect component hierarchy
- View props and state

### Backend Debugging

**Console Logs:**
- Add `console.log()` in `functions/` code
- Logs appear in Terminal 2 (Wrangler terminal)

**Wrangler Logs:**
```bash
npx wrangler pages dev dist --live-reload --log-level=debug
```

### API Testing

**Test API directly:**
```bash
# Get earthquakes
curl http://localhost:8787/api/quakes?feed=all_day

# Get weather
curl "http://localhost:8787/api/weather?lat=34.05&lon=-118.25&t=1696377600000"

# Health check
curl http://localhost:8787/api/health
```

---

## 🔥 Hot Reload Features

### Frontend Hot Reload (Vite HMR)

**What updates instantly:**
- ✅ React components
- ✅ CSS/Tailwind changes
- ✅ TypeScript files
- ✅ Imported modules

**Preserves:**
- ✅ Component state (most of the time)
- ✅ Form inputs
- ✅ Scroll position

### Backend Hot Reload (Wrangler)

**What updates automatically:**
- ✅ Function code changes
- ✅ Route handler changes
- ✅ Utility function changes

**Requires manual restart:**
- ⚠️ Changes to `.dev.vars`
- ⚠️ Changes to `wrangler.toml`

---

## 🎨 Tailwind CSS

Tailwind is configured and works with hot reload:

1. Edit any component with Tailwind classes
2. Save the file
3. Styles update instantly

**Tailwind config:** `tailwind.config.ts`

---

## 🧪 Testing Features Locally

### Test Earthquake Map:

1. Go to http://localhost:5173
2. Wait for earthquakes to load (2-3 seconds)
3. You should see markers on the map
4. Click a marker to see details

### Test Weather Integration:

1. Click an earthquake marker
2. Click "Show Weather & Insights"
3. Weather data loads from OpenWeather API
4. AI insight generates automatically

### Test Filters:

1. Use left sidebar to change time window
2. Adjust magnitude sliders
3. Map updates in real-time

### Test Dark Mode:

1. Click the sun/moon icon in header
2. Theme switches instantly

---

## 🌐 Network Requests

Watch API calls in browser DevTools:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Make actions in the app
4. See requests to:
   - `/api/quakes` - Earthquake data
   - `/api/weather` - Weather data
   - `/api/insight` - AI insights

---

## ⚠️ Common Issues & Solutions

### Issue: "Cannot find module 'xyz'"
**Solution:**
```bash
rm -rf node_modules
npm install
```

### Issue: Port 5173 or 8787 already in use
**Solution (Windows):**
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 8787
netstat -ano | findstr :8787
taskkill /PID <PID> /F
```

### Issue: Map doesn't load
**Solution:**
- Check `MAPBOX_TOKEN` in `.dev.vars`
- Make sure backend server is running
- Check browser console for errors

### Issue: Weather API errors
**Solution:**
- Verify `OPENWEATHER_API_KEY` in `.dev.vars`
- Check you haven't exceeded rate limits (30 req/10min)
- Restart backend server: `npx wrangler pages dev dist`

### Issue: Changes not reflecting
**Solution:**
- Hard refresh browser: Ctrl + Shift + R
- Clear browser cache
- Restart dev servers

### Issue: TypeScript errors in IDE
**Solution:**
```bash
npm run type-check
```
Fix reported errors, or restart your IDE/TypeScript server

---

## 🚀 Build for Production Testing

Want to test the production build locally?

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

This opens at: http://localhost:4173

Or test with Wrangler:
```bash
npx wrangler pages dev dist
```

---

## 📊 Performance Monitoring

### Frontend Performance:

1. Open DevTools
2. Go to **Lighthouse** tab
3. Run audit on http://localhost:5173

### Backend Performance:

- Watch response times in Network tab
- Check server logs for slow queries
- Monitor API response times

---

## 🎯 Development Tips

### 1. Use TypeScript Properly
- Let TypeScript catch errors early
- Use proper types, avoid `any`
- Run `npm run type-check` regularly

### 2. Use React DevTools
- Inspect component hierarchy
- Debug props and state
- Find performance issues

### 3. Check Console Regularly
- Frontend errors appear in browser console
- Backend errors appear in Wrangler terminal
- Fix warnings as you go

### 4. Test Responsive Design
- Use browser DevTools device emulation
- Test mobile, tablet, and desktop views
- Check dark mode on all sizes

### 5. Monitor API Calls
- Keep Network tab open
- Watch for failed requests
- Check response times

---

## 🔄 Git Workflow

```bash
# Make changes
# Test locally
# Verify everything works

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Deploy (if automatic deployment is set up)
# Or manually: deploy.bat
```

---

## 📚 Additional Resources

- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Mapbox GL Docs:** https://docs.mapbox.com/mapbox-gl-js/

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start frontend dev server | `npm run dev` |
| Start backend dev server | `npx wrangler pages dev dist` |
| Build for production | `npm run build` |
| Type check | `npm run type-check` |
| Deploy to Cloudflare | `deploy.bat` |

---

## 🎉 You're Ready!

**To start developing:**

1. Open **two terminals**
2. Terminal 1: `npm run dev`
3. Terminal 2: `npx wrangler pages dev dist --live-reload`
4. Open browser: http://localhost:5173
5. Start coding! ⚡

**Or use the quick script:**
- Windows: Double-click `dev.bat`

---

**Happy coding! 🚀**

