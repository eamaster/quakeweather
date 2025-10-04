# 🔧 QuakeWeather Troubleshooting Guide

## ✅ **Current Status: Working with OpenWeather API**

**Your API Key:** `REMOVED_OPENWEATHER_API_KEY`

### ✅ **Project Uses Smart API Selection**

QuakeWeather automatically tries One Call API 3.0 first, then falls back to Current Weather API if needed.

**Current Implementation:**
- ✅ Smart API endpoint selection
- ✅ Automatic fallback system
- ✅ Enhanced weather features when available
- ✅ Compatible with free and paid OpenWeather accounts

---

## 🔍 How to Test Your API Key

### Test Current Weather API (Always Works)

Open your browser and visit this URL:

```
https://api.openweathermap.org/data/2.5/weather?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY&units=metric
```

**Expected Result:** You should see JSON weather data with current conditions.

### Test One Call API 3.0 (If You Have Subscription)

```
https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid=REMOVED_OPENWEATHER_API_KEY&units=metric
```

**If it works:** You'll get enhanced weather data with forecasts.
**If it fails:** App will automatically fall back to Current Weather API.

---

## 🎯 How Weather Should Work in QuakeWeather

### Step-by-Step User Flow

1. **Start the app** - You should see earthquake markers on the map
2. **Click on a cluster** (large circle with number) - Map zooms in
3. **Click individual earthquake marker** - A popup card appears on the right
4. **Click "Show Weather & Insights"** button in the popup
5. **Weather loads** - You should see current conditions and AI insights

### If You Don't See the Weather Button

**Check:**
- Did you click on an individual earthquake marker (not a cluster)?
- Is the popup card visible on the right side?
- Look for the blue button that says "Show Weather & Insights"

### If the Weather Button Does Nothing

**Check browser console (F12):**
1. Open DevTools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Click "Show Weather & Insights" button
4. Look for error messages

**Common errors:**

**Error: "Failed to fetch weather data"**
- Backend server (port 8787) is not running
- Restart: `npx wrangler pages dev dist --port=8787`

**Error: "Rate limit exceeded"**
- You've made too many requests (limit: 30 per 10 minutes)
- Wait 10 minutes and try again

**Error: "OpenWeather API error: 401"**
- Your API key is invalid or expired
- Check `.dev.vars` file has correct API key

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

### Issue 3: Map Loads But No Earthquakes

**Symptoms:**
- Map appears but is empty
- No markers visible

**Solution:**
1. **Check browser console** for errors
2. **Try different time window** in the left sidebar
3. **Check USGS API status:** https://earthquake.usgs.gov/

### Issue 4: Rate Limit Errors

**Symptoms:**
- Error: "Rate limit exceeded"
- Weather stops loading after several requests

**Solution:**
- Wait 10 minutes (limit: 30 requests per 10 minutes)
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
[wrangler:err] Error fetching weather: OpenWeather API error: 401 Unauthorized
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
  }
}
```

**Error response (if API key is wrong):**
```json
{
  "error": "Failed to fetch weather data",
  "message": "OpenWeather API error: 401 Unauthorized"
}
```

---

## ✅ Quick Fix Checklist

- [ ] API key is correct in `.dev.vars`
- [ ] Backend server running on port 8787
- [ ] Frontend server running on port 5173
- [ ] Clicked on individual earthquake marker (not cluster)
- [ ] Clicked "Show Weather & Insights" button
- [ ] Checked browser console for errors
- [ ] Checked backend terminal for error logs

---

## 🚀 If Everything Fails

### Complete Reset

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

**Weather:**
```bash
curl "http://localhost:8787/api/weather?lat=34.05&lon=-118.25&t=1696377600000"
```

### OpenWeather Support

- **API Status:** https://status.openweathermap.org/
- **FAQ:** https://openweathermap.org/faq
- **Support:** https://openweathermap.org/support

---

**Last Updated:** October 4, 2025
