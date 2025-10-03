# QuakeWeather - Quick Start Guide

Get QuakeWeather running in **5 minutes**! 🚀

## Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Configure Environment

Create `.dev.vars` file in the root directory:

```env
OPENWEATHER_API_KEY=your_key_here
MAPBOX_TOKEN=your_token_here
```

### Getting API Keys (Free Tier)

**OpenWeather API Key:**
1. Visit https://openweathermap.org/api/one-call-3
2. Sign up for a free account
3. Go to API keys section
4. Copy your API key

**Mapbox Token:**
1. Visit https://account.mapbox.com/
2. Sign up or log in
3. Create a new access token
4. Copy the token

> **Note:** The provided keys in `.dev.vars` are for demo purposes. Get your own for production use!

## Step 3: Start Development Servers

**Terminal 1 - Frontend:**
```bash
pnpm dev
```
This starts Vite dev server at http://localhost:5173

**Terminal 2 - Backend:**
```bash
pnpm worker:dev
```
This starts the API server at http://localhost:8787

## Step 4: Open the App

Navigate to http://localhost:5173 in your browser!

## What You Should See

1. **Interactive map** centered on the US
2. **Earthquake markers** (colored by magnitude)
3. **Left sidebar** with time window and magnitude controls
4. **Click any earthquake** to see:
   - Event details
   - Current weather conditions
   - AI-generated insights

## Common Issues

### Port Already in Use

If port 5173 or 8787 is taken:
```bash
# For frontend, Vite will auto-assign another port
# For backend, kill the process using port 8787
```

### API Keys Not Working

- Ensure `.dev.vars` exists in the root directory
- Check that keys are on separate lines without quotes
- Restart the worker dev server after adding keys

### Map Not Loading

- Check browser console for errors
- Verify Mapbox token is valid
- Ensure you have an internet connection

### No Earthquakes Showing

- Wait a few seconds for data to load
- Check the time window filter (try "Past Day")
- Adjust magnitude range slider
- Check browser network tab for API errors

## Next Steps

- Read the [README.md](README.md) for full documentation
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Deploy to Cloudflare Pages for production

## Build for Production

```bash
pnpm build
```

Output will be in the `dist/` directory.

## Deploy to Cloudflare Pages

```bash
pnpm pages:deploy
```

Make sure to set environment variables in Cloudflare dashboard!

---

**Need Help?** Open an issue on GitHub!

