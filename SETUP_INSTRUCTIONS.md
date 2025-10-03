# QuakeWeather - Complete Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Git** (optional) - For version control

## Step-by-Step Setup

### 1. Install Dependencies

Open a terminal in the project root and run:

```bash
pnpm install
```

This will install all required packages including:
- React, TypeScript, Vite
- Mapbox GL, TanStack Query
- Hono, Zod
- Cloudflare Workers types
- Tailwind CSS

**Expected time:** 1-2 minutes

### 2. Configure API Keys

You need two free API keys to run QuakeWeather:

#### OpenWeather API Key

1. Go to [OpenWeather One Call API](https://openweathermap.org/api/one-call-3)
2. Click "Sign Up" and create a free account
3. After signing in, go to "API keys" section
4. Copy your default API key (or create a new one)

#### Mapbox Access Token

1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in
3. Go to "Access tokens"
4. Copy your default public token (or create a new one)
   - Ensure the token has the following scopes:
     - `styles:read`
     - `fonts:read`
     - `datasets:read`

### 3. Create Environment File

Create a file named `.dev.vars` in the project root:

```bash
# On Windows (PowerShell)
New-Item -Path .dev.vars -ItemType File

# On macOS/Linux
touch .dev.vars
```

Open `.dev.vars` in a text editor and add your keys:

```env
OPENWEATHER_API_KEY=your_openweather_key_here
MAPBOX_TOKEN=your_mapbox_token_here
```

**Important:** 
- Replace the placeholder values with your actual keys
- Do NOT add quotes around the values
- Do NOT commit this file to version control (it's already in .gitignore)

### 4. Start Development Servers

You need to run TWO servers simultaneously:

**Terminal 1 - Frontend (Vite):**
```bash
pnpm dev
```

Expected output:
```
VITE v5.3.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Terminal 2 - Backend (Wrangler):**
```bash
pnpm worker:dev
```

Expected output:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 5. Open the Application

Navigate to http://localhost:5173 in your web browser.

You should see:
- QuakeWeather header with dark mode toggle
- Interactive map with earthquake markers
- Left sidebar with controls
- Yellow disclaimer footer

## Verify Installation

### Test the Map

1. The map should load within 2-3 seconds
2. You should see colored circular markers representing earthquakes
3. Zoom and pan controls should work smoothly

### Test Earthquake Data

1. Markers should be color-coded:
   - Green: Minor (< 3.0)
   - Yellow: Light (3.0-4.0)
   - Orange: Moderate (4.0-5.0)
   - Red: Strong (5.0-6.0)
   - Purple: Major (6.0+)

### Test Filters

1. Use the left sidebar to change "Time Window"
2. Click "Past Hour" - map should update with fewer earthquakes
3. Adjust magnitude sliders - markers should filter accordingly

### Test Weather & Insights

1. Click on any earthquake marker
2. A popup should appear on the right side
3. Click "Show Weather & Insights" button
4. Weather data should load within 1-2 seconds
5. You should see:
   - Current temperature and conditions
   - Wind, humidity, pressure data
   - AI-generated insight paragraph
   - Scientific disclaimer

## Troubleshooting

### Issue: Dependencies won't install

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules
pnpm install
```

### Issue: Map doesn't render

**Check:**
- Console errors (F12 in browser)
- Verify Mapbox token in `.dev.vars`
- Ensure you have internet connection
- Try a different browser

**Solution:**
```bash
# Restart the dev server
# Press Ctrl+C in Terminal 1, then:
pnpm dev
```

### Issue: Weather API returns 401 Unauthorized

**Solution:**
- Check OpenWeather API key is correct in `.dev.vars`
- Verify the key is active (can take 10 minutes after signup)
- Restart the worker dev server:
  ```bash
  # Press Ctrl+C in Terminal 2, then:
  pnpm worker:dev
  ```

### Issue: Rate limit exceeded

**Explanation:**
The app limits weather API calls to 30 per 10 minutes per IP to stay within free tier limits.

**Solution:**
- Wait 10 minutes
- Clear browser cache
- Restart the worker dev server

### Issue: Port already in use

**Solution for Frontend (5173):**
```bash
# Vite will automatically try the next available port
# Just note the new port number in the terminal output
```

**Solution for Backend (8787):**
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 8787).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:8787 | xargs kill
```

### Issue: TypeScript errors

**Solution:**
```bash
# Run type check to see specific errors
pnpm type-check

# Most errors are resolved by ensuring all dependencies are installed
pnpm install
```

### Issue: No earthquakes showing

**Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for `/api/quakes` request
4. Check if it returns data

**Solution:**
- Try changing time window to "Past Day"
- Reset magnitude filters to 0.0 - 10.0
- Check USGS API status: https://earthquake.usgs.gov/

## Next Steps

### Development

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Explore the codebase starting with `src/client/App.tsx`
- Make changes and see them hot-reload instantly

### Building for Production

```bash
pnpm build
```

Output will be in `dist/` directory.

### Deploying

See [README.md](README.md) for Cloudflare Pages deployment instructions.

## Getting Help

- Check [README.md](README.md) for full documentation
- Review [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture details
- Open an issue on GitHub for bugs or questions

---

**Congratulations!** You're all set up. Explore earthquakes and weather data! 🌍⚡

