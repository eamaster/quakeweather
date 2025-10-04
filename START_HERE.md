# 🎯 QuakeWeather - START HERE

**Quick reference for running and deploying QuakeWeather**

---

## 🖥️ Run Locally (Testing)

### Quick Start - One Command (Windows)

**Double-click this file:**
```
dev.bat
```

This automatically starts both frontend and backend servers!

### Manual Start (Any OS)

**Open 2 terminals in the project folder:**

**Terminal 1 - Frontend:**
```bash
npm run dev
```
→ Opens at: **http://localhost:5173**

**Terminal 2 - Backend:**
```bash
npx wrangler pages dev dist --live-reload
```
→ Runs at: **http://localhost:8787**

**Then open:** http://localhost:5173 in your browser

---

## 🚀 Deploy to Production

### Quick Deploy (Windows)

**Double-click this file:**
```
deploy.bat
```

### Manual Deploy (Any OS)

```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

---

## 📚 Full Documentation

- **`LOCAL_DEVELOPMENT.md`** - Complete local testing guide
- **`HOW_TO_DEPLOY.md`** - Deployment instructions
- **`DEPLOYMENT_STATUS.md`** - Current deployment status
- **`README.md`** - Project overview

---

## 🌐 Live App URLs

- **Production:** https://main.quakeweather.pages.dev
- **Cloudflare Dashboard:** https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather

---

## ⚙️ Environment Variables

Your API keys are in `.dev.vars` (local) and must also be set in Cloudflare Pages dashboard (production):

**Required:**
- `OPENWEATHER_API_KEY` = `REMOVED_OPENWEATHER_API_KEY`
- `MAPBOX_TOKEN` = `REMOVED_MAPBOX_TOKEN`

**Add in Cloudflare:**
https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/quakeweather/settings/environment-variables

---

## 🔧 Common Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run locally | `npm run dev` (+ wrangler in another terminal) |
| Build | `npm run build` |
| Deploy | `deploy.bat` or see HOW_TO_DEPLOY.md |
| Type check | `npm run type-check` |

---

## ✅ Quick Checklist

### For Local Development:
- [ ] Run `npm install`
- [ ] Check `.dev.vars` has API keys
- [ ] Start frontend: `npm run dev`
- [ ] Start backend: `npx wrangler pages dev dist`
- [ ] Open http://localhost:5173

### For Production Deployment:
- [ ] Environment variables set in Cloudflare Pages
- [ ] Code committed to GitHub
- [ ] Run `deploy.bat` or manual deploy
- [ ] Verify at https://main.quakeweather.pages.dev

---

## 🆘 Need Help?

1. **Local development issues?** → See `LOCAL_DEVELOPMENT.md`
2. **Deployment issues?** → See `HOW_TO_DEPLOY.md`
3. **API not working?** → Check environment variables
4. **Map not loading?** → Verify MAPBOX_TOKEN

---

## 🎉 You're All Set!

**To start right now:**

1. Double-click `dev.bat` (Windows)
   OR
   Run `npm run dev` in terminal

2. Open http://localhost:5173

3. Start testing!

**Happy developing! 🚀**

