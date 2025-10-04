# 🔧 QuakeWeather Troubleshooting Guide

## ✅ UPDATED: Now Using FREE One Call API 2.5

**Your API Key:** `REMOVED_OPENWEATHER_API_KEY`

### ✅ **FIXED: Project Now Uses Free Tier API**

QuakeWeather has been **updated to use One Call API 2.5** which is **FREE** and compatible with your student account!

**Change Made:**
- ✅ Updated `src/server/lib/openweather.ts` to use API 2.5
- ✅ Endpoint changed from `data/3.0/onecall` → `data/2.5/onecall`
- ✅ Compatible with free/student OpenWeather accounts

#### Previous Problem (Now Resolved)

Previously, QuakeWeather used **OpenWeather One Call API 3.0**, which requires a **separate paid subscription** called "One Call by Call". A standard free OpenWeather API key **did not work** with that endpoint.

According to OpenWeather documentation:
- One Call API 3.0 endpoint: `https://api.openweathermap.org/data/3.0/onecall`
- Requires subscription: **"One Call by Call"** ($0 for 1,000 calls/day, then pay-per-call)
- Free tier API keys from the standard plans **do not have access**

#### How to Fix

**Option 1: Subscribe to One Call API 3.0 (Recommended for Production)**

1. **Go to:** https://openweathermap.org/api/one-call-3
2. **Click "Subscribe"** under "One Call by Call"
3. **Choose the plan:**
   - First 1,000 calls/day are FREE
   - Then $0.0015 per call (very affordable)
4. **Complete subscription**
5. Your existing API key will now work with One Call API 3.0

**Option 2: Downgrade to One Call API 2.5 (Free but Limited)**

If you want to use the free tier, we need to modify the code to use One Call API 2.5:

Changes needed in `src/server/lib/openweather.ts`:

```typescript
// Change line 5 from:
const ONECALL_BASE = 'https://api.openweathermap.org/data/3.0/onecall';

// To:
const ONECALL_BASE = 'https://api.openweathermap.org/data/2.5/onecall';
```

**⚠️ Warning:** One Call API 2.5 is deprecated and will be discontinued. OpenWeather recommends using 3.0.

---

## 🔍 How to Test Your API Key

### Test if Your Key Has One Call 3.0 Access

Open your browser and visit this URL (replace with your actual coordinates):

```
https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY
```

**Expected Results:**

✅ **If it works:** You'll see JSON weather data
```json
{
  "lat": 33.44,
  "lon": -94.04,
  "timezone": "America/Chicago",
  "current": { ... },
  "hourly": [ ... ]
}
```

❌ **If it fails:** You'll see an error
```json
{
  "cod": 401,
  "message": "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."
}
```
or
```json
{
  "cod": 403,
  "message": "Access denied. You need to subscribe to use this API."
}
```

### Test with One Call API 2.5 (Free Tier)

Try this URL to see if your key works with the free 2.5 API:

```
https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY
```

If this works but 3.0 doesn't, your key only has access to the free tier.

---

## 🎯 How Weather Should Work in QuakeWeather

### Step-by-Step User Flow

1. **Start the app** - You should see earthquake markers on the map
2. **Click any earthquake marker** - A popup card appears on the right
3. **Click "Show Weather & Insights"** button in the popup
4. **Weather loads** - You should see current conditions, forecast, and AI insights

### If You Don't See the Weather Button

**Check:**
- Did you click on an earthquake marker?
- Is the popup card visible on the right side?
- Look for the blue button that says "Show Weather & Insights"

### If the Weather Button Does Nothing

**Check browser console (F12):**
1. Open DevTools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Click "Show Weather & Insights" button
4. Look for error messages

**Common errors:**

**Error: "OpenWeather API error: 401"**
- Your API key is invalid or expired
- Get a new key from https://openweathermap.org/api

**Error: "OpenWeather API error: 403"**
- Your API key doesn't have access to One Call API 3.0
- Subscribe to One Call by Call plan

**Error: "Rate limit exceeded"**
- You've made too many requests (limit: 30 per 10 minutes)
- Wait 10 minutes and try again

**Error: "Failed to fetch"**
- Backend server (port 8787) is not running
- Restart: `npx wrangler pages dev dist --port=8787`

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend Server Not Running

**Symptoms:**
- API calls to `/api/weather` fail
- Browser console shows "Failed to fetch" errors

**Solution:**
```bash
# Make sure backend is running on port 8787
npx wrangler pages dev dist --port=8787
```

Check if it's running:
```bash
curl http://localhost:8787/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-10-04T..."}
```

---

### Issue 2: Environment Variable Not Set

**Symptoms:**
- Error: "OpenWeather API key not configured"

**Solution:**

1. **Check `.dev.vars` file exists:**
```bash
# Should contain:
OPENWEATHER_API_KEY=REMOVED_OPENWEATHER_API_KEY
MAPBOX_TOKEN=REMOVED_MAPBOX_TOKEN
```

2. **Restart the backend server** (Wrangler reads `.dev.vars` on startup)

---

### Issue 3: CORS Errors

**Symptoms:**
- Browser console shows "CORS policy" errors
- Weather API calls are blocked

**Solution:**
- This shouldn't happen in local development
- Make sure you're accessing via `http://localhost:5173` (not `127.0.0.1` or file://)
- Check that Vite proxy is configured (it is in `vite.config.ts`)

---

### Issue 4: Map Loads But No Earthquakes

**Symptoms:**
- Map appears but is empty
- No markers visible

**Solution:**

1. **Check browser console** for errors
2. **Verify `/api/quakes` is working:**
   ```bash
   curl http://localhost:8787/api/quakes?feed=all_day
   ```
3. **Try different time window** in the left sidebar
4. **Check USGS API status:** https://earthquake.usgs.gov/

---

### Issue 5: "Retry-After" or Rate Limit Errors

**Symptoms:**
- Error: "Rate limit exceeded"
- Weather stops loading after several requests

**Explanation:**
- QuakeWeather limits weather API calls to **30 per 10 minutes**
- This protects your API quota

**Solution:**
- Wait 10 minutes
- Use weather data sparingly
- Cache is enabled (10 minutes) to reduce API calls

---

## 🔬 Debugging Steps

### 1. Check Backend Logs

When you click "Show Weather & Insights", watch the backend terminal:

**Good log:**
```
[wrangler:info] GET /api/weather?lat=34.05&lon=-118.25&t=1696377600000 200 OK (823ms)
```

**Bad logs:**
```
[wrangler:err] GET /api/weather?lat=34.05&lon=-118.25&t=1696377600000 401 Unauthorized
Error fetching weather: OpenWeather API error: 401 Unauthorized
```

### 2. Test API Directly

**Test weather endpoint:**
```bash
curl "http://localhost:8787/api/weather?lat=34.05&lon=-118.25&t=1696377600000"
```

**Expected response (if working):**
```json
{
  "current": {
    "temp": 22.5,
    "weather": [{"description": "clear sky", "icon": "01d"}],
    ...
  },
  "hourly": [...],
  "alerts": [...]
}
```

**Error response (if API key is wrong):**
```json
{
  "error": "Failed to fetch weather data",
  "message": "OpenWeather API error: 401 Unauthorized"
}
```

### 3. Enable Verbose Logging

Add this to `src/server/lib/openweather.ts` after line 35:

```typescript
const url = `${ONECALL_BASE}?${params.toString()}`;
console.log('[DEBUG] Fetching weather from:', url); // Add this line

const response = await fetch(url);
```

This will show the exact URL being called in the backend logs.

---

## ✅ Quick Fix Checklist

- [ ] OpenWeather One Call API 3.0 subscription active
- [ ] API key is correct in `.dev.vars`
- [ ] Backend server running on port 8787
- [ ] Frontend server running on port 5173
- [ ] Clicked on an earthquake marker
- [ ] Clicked "Show Weather & Insights" button
- [ ] Checked browser console for errors
- [ ] Checked backend terminal for error logs
- [ ] Tested API key with direct URL (see above)

---

## 🚀 If Everything Fails

### Nuclear Option: Complete Reset

1. **Stop all servers** (Ctrl+C in both terminals)

2. **Clear cache:**
   ```bash
   # Windows
   del /f /s /q .wrangler\*
   
   # Linux/Mac
   rm -rf .wrangler/*
   ```

3. **Reinstall dependencies:**
   ```bash
   npm install
   ```

4. **Rebuild:**
   ```bash
   npm run build
   ```

5. **Restart servers:**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npx wrangler pages dev dist --port=8787
   ```

---

## 📞 Getting More Help

### Check Logs

**Backend logs:** Look at the terminal running `wrangler pages dev`
**Frontend logs:** Open browser DevTools (F12) → Console tab

### Test Endpoints

**Health check:**
```bash
curl http://localhost:8787/api/health
```

**Earthquakes:**
```bash
curl http://localhost:8787/api/quakes?feed=all_hour
```

**Weather (with real coordinates):**
```bash
curl "http://localhost:8787/api/weather?lat=34.05&lon=-118.25&t=1696377600000"
```

### OpenWeather Support

- **API Status:** https://status.openweathermap.org/
- **FAQ:** https://openweathermap.org/faq
- **Support:** https://openweathermap.org/support

---

## 🎯 Most Likely Solution for Your Issue

Based on your description, the **most likely cause** is:

### ⚠️ Your API Key Doesn't Have One Call API 3.0 Access

**Fix:**
1. Go to: https://openweathermap.org/api/one-call-3
2. Click "Subscribe" under "One Call by Call"
3. Complete the free subscription (1,000 calls/day free)
4. Your API key will now work!

**Or alternatively:**
1. Switch to One Call API 2.5 (change line 5 in `src/server/lib/openweather.ts`)
2. This works with free API keys but is deprecated

---

**Last Updated:** October 4, 2025
