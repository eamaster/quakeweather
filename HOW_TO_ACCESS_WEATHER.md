# 🌤️ How to Access Weather Data in QuakeWeather

## 🎯 **The Issue: You Need to Expand Clusters First**

The large circles you see (like "91", "28", etc.) are **clusters** of multiple earthquakes. To access weather data, you need to expand these clusters first.

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Restart Backend Server (If Not Done)**

```bash
npx wrangler pages dev dist --port=8787
```

### **Step 2: Open Browser**

Go to: http://localhost:5173

### **Step 3: Expand a Cluster**

1. **Click on one of the large colored circles** (like the red "91" circle over the western US)
2. **The map will zoom in** and the cluster will expand
3. **You'll see individual earthquake markers** (smaller circles)

### **Step 4: Click Individual Earthquake**

1. **After expanding a cluster**, you'll see individual earthquake points
2. **Click on any individual earthquake marker** (small circle)
3. **The popup card will appear** on the right side

### **Step 5: Access Weather Data**

1. **In the popup card**, look for the blue button
2. **Click "Show Weather & Insights"** button
3. **Weather data will load** and you'll see:
   - Current temperature and conditions
   - Wind, humidity, pressure data
   - AI-generated insights

---

## 🔍 **Visual Guide**

### **What You See Now (Clusters):**
```
🔴 91    🟡 28    🟠 5    🟢 3
(Large circles with numbers)
```

### **What You Need to See (Individual Earthquakes):**
```
🔴 🔴 🔴 🔴 🔴 🔴 🔴 🔴
(Small individual circles)
```

---

## 🧪 **Debugging: Check Browser Console**

I've added console logging to help debug. Open browser DevTools (F12) and check the Console tab:

### **When You Click a Cluster:**
```
Cluster clicked, expanding... 12345
```

### **When You Click Individual Earthquake:**
```
Individual earthquake clicked: 5km NW of Somewhere, CA 2.3
```

### **When Weather Loads:**
```
[wrangler:info] GET /api/weather?lat=...&lon=...&t=... 200 OK (800ms)
```

---

## 🎯 **Quick Test**

1. **Click the red "91" cluster** over the western US
2. **Wait for map to zoom in**
3. **Click any small earthquake circle**
4. **Look for popup on the right side**
5. **Click "Show Weather & Insights"**
6. **Check backend terminal for weather API calls**

---

## ⚠️ **Common Issues**

### **Issue: No Popup Appears**
- **Cause:** You clicked on a cluster, not individual earthquake
- **Solution:** Expand cluster first, then click individual earthquake

### **Issue: Map Doesn't Zoom When Clicking Cluster**
- **Cause:** Map might be loading or there's a JavaScript error
- **Solution:** Check browser console (F12) for errors

### **Issue: No Individual Earthquakes After Expanding**
- **Cause:** Cluster might be too dense
- **Solution:** Try a different cluster or zoom in more manually

### **Issue: Weather Button Not Working**
- **Cause:** Backend server not running or API key issue
- **Solution:** Check backend terminal for errors

---

## 🚀 **Expected Flow**

1. ✅ **See clusters** (large circles with numbers)
2. ✅ **Click cluster** → Map zooms in
3. ✅ **See individual earthquakes** (small circles)
4. ✅ **Click individual earthquake** → Popup appears
5. ✅ **Click "Show Weather & Insights"** → Weather loads
6. ✅ **See weather data** in popup

---

## 📊 **What Weather Data You'll See**

- 🌡️ **Temperature:** Current temp in Celsius
- 💨 **Wind:** Speed, direction, gusts
- 💧 **Humidity:** Percentage
- 📊 **Pressure:** Atmospheric pressure
- 👁️ **Visibility:** Distance in km
- 🌤️ **Conditions:** Clear, cloudy, rainy, etc.
- 🤖 **AI Insights:** Contextual analysis

---

## 🔧 **If Still Not Working**

### **Check Backend Logs:**
Look for these in your backend terminal:
```
[wrangler:info] GET /api/weather?lat=...&lon=...&t=... 200 OK (800ms)  ✅ Good
[wrangler:err] Error fetching weather: ...                           ❌ Bad
```

### **Check Browser Console:**
Open DevTools (F12) → Console tab:
- Look for JavaScript errors
- Check for "Cluster clicked" and "Individual earthquake clicked" messages

### **Test API Directly:**
```bash
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:8787/api/weather?lat=33.44&lon=-94.04&t=1696377600000' -UseBasicParsing | Select-Object -ExpandProperty Content"
```

---

## 🎉 **Success Indicators**

- ✅ **Backend logs show:** `GET /api/weather` calls
- ✅ **Browser console shows:** Click event messages
- ✅ **Popup appears:** On the right side of screen
- ✅ **Weather loads:** Temperature, wind, humidity displayed
- ✅ **AI insights appear:** Contextual analysis paragraph

---

**The key is: Click clusters first to expand them, then click individual earthquakes to see the popup with weather data!** 🚀
