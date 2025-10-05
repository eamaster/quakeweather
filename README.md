# QuakeWeather

> **Educational web app** that combines **USGS earthquake data** with **OpenWeather conditions** and provides **AI-generated insights**.

![QuakeWeather](https://img.shields.io/badge/status-production-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ⚠️ Important Disclaimer

**This tool is for education and exploration only.** Earthquake prediction is **not** scientifically reliable; outputs must not be used for safety-critical decisions. Weather and seismic activity are independent phenomena.

---

## Features

### 🗺️ Interactive Mapping
- **Mapbox GL JS** with clustered earthquake visualization
- **Color-coded markers** by magnitude (green → purple for minor → major)
- **Dynamic radius scaling** based on earthquake magnitude
- **Smooth zoom and pan** controls with geolocation support
- **Mobile-responsive** design with collapsible sidebar

### 🌍 Real-time Earthquake Data
- **USGS Earthquake API** integration with multiple feed options:
  - Past Hour (`all_hour`) - All earthquakes in the last hour
  - Past Day (`all_day`) - All earthquakes in the last 24 hours  
  - M2.5+ Day (`2.5_day`) - Magnitude 2.5+ in the last day
  - M4.5+ Week (`4.5_week`) - Magnitude 4.5+ in the last week
  - Significant Month (`significant_month`) - Significant earthquakes in the last month
- **Advanced filtering** with magnitude range slider (0.0 - 10.0)
- **Context scoring** for earthquake ranking and relevance
- **Conditional requests** with ETag support for efficient data fetching

### ☁️ Smart Weather Integration
- **OpenWeather One Call API 3.0** with intelligent fallback system:
  - **Historical weather data** using timemachine endpoint for past earthquakes
  - **Current conditions** with 8-hour hourly forecasts
  - **Weather alerts** display when available
  - **Automatic fallback** to Current Weather API if One Call API unavailable
  - **Approximate mode** indicator when historical data isn't available
- **Weather details**: Temperature, humidity, pressure, wind speed/direction, visibility
- **Smart caching** with coordinate rounding for optimal performance

### 🤖 AI-Generated Insights
- **Rule-based contextual analysis** combining earthquake and weather data
- **Magnitude classification** (minor → light → moderate → strong → major)
- **Weather impact assessment** (wind effects, precipitation probability, pressure analysis)
- **Depth analysis** (shallow vs deep earthquake effects)
- **Educational disclaimers** emphasizing non-predictive nature
- **Cached insights** for performance optimization

### 🎨 Modern UI/UX
- **Responsive design** optimized for mobile, tablet, and desktop
- **Dark mode** with system preference detection
- **Tailwind CSS** styling with smooth animations
- **Accessible components** with proper ARIA labels
- **Mobile hamburger menu** with slide-out sidebar
- **Popup cards** with earthquake details and weather integration

### 🚀 Production Features
- **Multi-layer caching** (server-side memory + Cloudflare Cache API + client-side)
- **Rate limiting** with token bucket algorithm (30 requests/10min per IP)
- **Error handling** with graceful degradation
- **Security headers** and CORS configuration
- **Type safety** with TypeScript throughout
- **Performance optimization** with code splitting and tree-shaking

---

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** - UI library with TypeScript
- **TailwindCSS** - Utility-first styling
- **Mapbox GL JS** - Interactive mapping
- **TanStack Query** - Data fetching and caching

### Backend
- **Cloudflare Pages Functions** - Serverless edge functions
- **Hono** - Lightweight web framework
- **Zod** - Type-safe validation

### Data Sources
- **USGS Earthquake API** - Real-time seismic data
- **OpenWeather API** - Weather conditions
- **Mapbox** - Map tiles and geocoding

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (recommended)
- **pnpm** (or npm/yarn)
- **Wrangler CLI** for Cloudflare deployment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quakeweather.git
   cd quakeweather
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.dev.vars` file in the root directory (this file is gitignored):
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   MAPBOX_TOKEN=your_mapbox_token_here
   ```

   **Getting API Keys:**
   - **OpenWeather**: Sign up at [OpenWeather](https://openweathermap.org/api) (free tier available)
   - **Mapbox**: Create a token at [Mapbox Account](https://account.mapbox.com/)

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

5. **Start the API server (in a separate terminal)**
   ```bash
   pnpm worker:dev
   ```

   The API will be available at `http://localhost:8787`

---

## Development

### Project Structure

```
quakeweather/
├── src/
│   ├── client/                    # React frontend
│   │   ├── components/            # UI components
│   │   │   ├── Map.tsx           # Interactive map with earthquake visualization
│   │   │   ├── Controls.tsx      # Sidebar with filters and time window selector
│   │   │   ├── PopupCard.tsx     # Earthquake details popup
│   │   │   ├── WeatherCard.tsx   # Weather conditions and forecasts
│   │   │   └── InsightCard.tsx   # AI-generated insights
│   │   ├── App.tsx               # Main app component with theme and state
│   │   ├── main.tsx              # Entry point with React Query setup
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── styles.css            # Global styles and custom scrollbar
│   └── server/                   # Backend API (Hono + Cloudflare Workers)
│       ├── routes/               # API route handlers
│       │   ├── quakes.ts         # USGS earthquake data endpoints
│       │   ├── weather.ts        # OpenWeather proxy with rate limiting
│       │   └── insight.ts        # AI insight generation
│       ├── lib/                  # Core utilities and business logic
│       │   ├── usgs.ts           # USGS API client with context scoring
│       │   ├── openweather.ts    # OpenWeather API with smart fallbacks
│       │   ├── insight.ts        # Rule-based AI insight generation
│       │   ├── cache.ts          # Multi-layer caching system
│       │   ├── rateLimit.ts      # Token bucket rate limiter
│       │   ├── utils.ts          # Helper functions
│       │   └── types.ts          # Shared TypeScript interfaces
│       └── index.ts              # Hono app initialization
├── functions/                    # Cloudflare Pages Functions (legacy)
├── public/                       # Static assets (favicon, etc.)
├── .github/workflows/            # GitHub Actions for deployment
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration with GitHub Pages base
├── wrangler.toml                # Cloudflare Workers configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Available Scripts

```bash
# Development
npm run dev           # Start Vite dev server (frontend)
npm run worker:dev    # Start Wrangler dev server (backend API)
npm run pages:dev     # Start Cloudflare Pages dev server

# Build & Type Checking
npm run build         # Build for production (TypeScript + Vite)
npm run type-check    # Run TypeScript type checking
npm run preview       # Preview production build locally

# Deployment
npm run worker:deploy # Deploy backend to Cloudflare Workers
npm run pages:deploy  # Deploy frontend to Cloudflare Pages

# Quick Deploy (Windows)
deploy.bat           # One-click deployment script
```

**Development Workflow:**
1. **Frontend**: `npm run dev` (runs on http://localhost:5173)
2. **Backend**: `npm run worker:dev` (runs on http://localhost:8787)
3. **Full Stack**: Both servers run simultaneously for development

---

## API Endpoints

### `GET /api/quakes`

Fetch earthquake data from USGS.

**Query Parameters:**
- `feed` - Feed type: `all_hour`, `all_day`, `2.5_day`, `4.5_week`, `significant_month` (default: `all_day`)
- OR use filtered search:
  - `starttime` - ISO timestamp
  - `endtime` - ISO timestamp
  - `minmagnitude` - Minimum magnitude
  - `latitude` + `longitude` + `maxradiuskm` - Location-based search

**Response:** GeoJSON FeatureCollection with context scores

**Caching:** 90 seconds with stale-while-revalidate

---

### `GET /api/weather`

Fetch weather data for a location with intelligent API selection.

**Query Parameters:**
- `lat` - Latitude (-90 to 90)
- `lon` - Longitude (-180 to 180)
- `t` - Timestamp (optional, defaults to current time)

**Smart API Selection:**
1. **Historical Data** (timestamp > 1 hour ago):
   - Uses OpenWeather One Call API 3.0 `timemachine` endpoint
   - Falls back to current `onecall` endpoint if timemachine unavailable
   - Falls back to Current Weather API if One Call API unavailable
2. **Current Data** (timestamp ≤ 1 hour ago):
   - Uses OpenWeather One Call API 3.0 `onecall` endpoint
   - Falls back to Current Weather API if One Call API unavailable

**Response:** Weather data with current conditions, hourly forecasts, and alerts (when available)

**Rate Limiting:** 30 requests per 10 minutes per IP

**Caching:** 10 minutes (current) / 1 hour (historical)

---

### `POST /api/insight`

Generate AI-assisted analysis for an earthquake.

**Request Body:**
```json
{
  "quake": { /* QuakeFeature */ },
  "weather": { /* WeatherResponse */ }
}
```

**Response:**
```json
{
  "text": "Main analysis paragraph...",
  "bullets": ["Key point 1", "Key point 2"],
  "disclaimer": "Educational disclaimer..."
}
```

**Caching:** 5 minutes

---

## Deployment

### 🚀 Multiple Deployment Options

QuakeWeather supports both **Cloudflare Pages** and **GitHub Pages** deployment:

#### Option 1: Cloudflare Pages (Recommended) ⭐

**Quick Deploy (Windows):**
```bash
# Just double-click this file:
deploy.bat
```

**Manual Deploy:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

**Set Environment Variables:**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Your Project → Settings → Environment Variables
- Add:
  - `OPENWEATHER_API_KEY` - Your OpenWeather API key
  - `MAPBOX_TOKEN` - Your Mapbox access token

**Automatic Deployments:**
- Connect GitHub repository to Cloudflare Pages
- Every `git push` to `main` triggers automatic deployment
- Preview deployments for pull requests

#### Option 2: GitHub Pages

**Automatic Deployment:**
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment on push to `main`.

**Setup:**
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. The workflow will automatically deploy to `https://yourusername.github.io/quakeweather`

**Backend Requirements:**
- GitHub Pages only serves static files
- Backend APIs must be deployed separately to Cloudflare Workers
- Frontend automatically detects and uses deployed backend URL

#### Option 3: Cloudflare Workers (Backend Only)

For the API backend:
```bash
npx wrangler deploy
```

**Set Secrets:**
```bash
npx wrangler secret put OPENWEATHER_API_KEY
npx wrangler secret put MAPBOX_TOKEN
```

---

## User Experience

### 🖱️ How to Use QuakeWeather

1. **View Earthquakes**: Open the app to see clustered earthquake markers on the map
2. **Filter Data**: Use the sidebar to select time window (hour/day/week/month) and magnitude range
3. **Explore Clusters**: Click on large circles to zoom in and see individual earthquakes
4. **Get Details**: Click individual earthquake markers to see popup with details
5. **Weather & Insights**: Click "Show Weather & Insights" to get weather conditions and AI analysis
6. **Mobile Navigation**: Use hamburger menu (☰) on mobile to access controls

### 📱 Mobile Features

- **Responsive Design**: Optimized for all screen sizes
- **Collapsible Sidebar**: Hamburger menu for mobile navigation
- **Touch-Friendly**: Large touch targets and smooth gestures
- **Full-Screen Map**: Sidebar slides out of the way on mobile
- **Responsive Popups**: Weather cards adapt to screen size

### 🎨 UI Components

- **Map Component**: Interactive Mapbox GL map with earthquake visualization
- **Controls Sidebar**: Time window selector and magnitude filter
- **PopupCard**: Earthquake details with weather integration button
- **WeatherCard**: Current conditions, forecasts, and weather alerts
- **InsightCard**: AI-generated contextual analysis
- **Mobile Overlay**: Backdrop for mobile sidebar navigation

---

## Architecture

### Caching Strategy

1. **USGS Earthquake Data**
   - Server-side cache: 90 seconds
   - Conditional requests with ETag support
   - Stale-while-revalidate for better performance

2. **Weather Data**
   - Server-side cache: 10 minutes (per rounded lat/lon)
   - Client-side cache: 1 minute (TanStack Query)
   - Coordinate rounding for cache hit optimization

3. **AI Insights**
   - Server-side cache: 5 minutes (per quake ID)

### Rate Limiting

- **Token bucket algorithm** for weather API
- **30 requests per 10 minutes** per IP address
- Graceful degradation with user-friendly error messages

### Security

- ✅ API keys stored in environment variables (never in client bundle)
- ✅ Server-side proxy for all external API calls
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ CORS configuration
- ✅ Input validation with Zod

---

## Performance

- **Code splitting** for optimal bundle sizes
- **Tree-shaking** for unused dependencies
- **Aggressive caching** at multiple levels
- **Debounced API calls** to prevent excessive requests
- **Clustered map markers** for better rendering performance
- **Edge deployment** with Cloudflare for global low latency

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **USGS** for providing real-time earthquake data
- **OpenWeather** for weather data API
- **Mapbox** for mapping infrastructure
- **Cloudflare** for edge computing platform

---

## Data Sources & Attribution

- **Earthquake Data**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/)
- **Weather Data**: [OpenWeather](https://openweathermap.org/)
- **Map Tiles**: [Mapbox](https://www.mapbox.com/)

---

## Live Demo

### 🌐 Production URLs

- **Cloudflare Pages**: https://quakeweather.hesam.me
- **GitHub Pages**: https://hesam.me/quakeweather
- **Backend API**: https://quakeweather-api.smah0085.workers.dev

### 🔧 Development URLs

- **Local Frontend**: http://localhost:5173
- **Local Backend**: http://localhost:8787

---

## Support

### 📚 Documentation

- **Quick Start**: See `START_HERE.md` for immediate setup
- **Deployment Guide**: See `HOW_TO_DEPLOY.md` for deployment options
- **Troubleshooting**: See `TROUBLESHOOTING.md` for common issues
- **Project Overview**: See `PROJECT_OVERVIEW.md` for technical details

### 🐛 Issues & Questions

For issues, questions, or suggestions, please [open an issue](https://github.com/eamaster/quakeweather/issues) on GitHub.

### 🔑 API Keys

**Current Working API Key**: `REMOVED_OPENWEATHER_API_KEY`
- ✅ Works with OpenWeather One Call API 3.0
- ✅ Works with OpenWeather Current Weather API
- ✅ Includes historical weather data access

---

**Built with ❤️ for education and exploration**

