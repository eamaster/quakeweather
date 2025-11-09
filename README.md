# QuakeWeather

> **Educational web app** that combines **USGS earthquake data** with **OpenWeather conditions** and provides **AI-generated insights**.

![QuakeWeather](https://img.shields.io/badge/status-production-green) ![License](https://img.shields.io/badge/license-MIT-blue) ![Secret Scanning](https://img.shields.io/badge/secret%20scanning-enabled-success) [![Security Policy](https://img.shields.io/badge/security-policy-blue)](SECURITY.md)

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
- **Cloudflare Pages Functions** - Serverless edge functions (API runs via `functions/` folder)
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
   
   Copy `.env.example` to `.dev.vars` and fill in your actual API keys:
   ```bash
   cp .env.example .dev.vars
   # Then edit .dev.vars with your actual keys
   ```
   
   **Required variables:**
   - `OPENWEATHER_API_KEY` - Get from [OpenWeather](https://openweathermap.org/api) (free tier available)
   - `VITE_MAPBOX_TOKEN` - Get from [Mapbox Account](https://account.mapbox.com/access-tokens/)
   - `COHERE_API_KEY` - Optional, get from [Cohere](https://cohere.com/) (for AI explanations)
   
   **Note:** `.dev.vars` is gitignored and should never be committed. The `.env.example` file contains placeholders only.

4. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

5. **Start the API server (in a separate terminal)**
   ```bash
   pnpm pages:dev
   ```

   The API will be available at `http://localhost:8787` via Cloudflare Pages Functions

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
│   └── server/                   # Backend API (Hono + Cloudflare Pages Functions)
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
├── functions/                    # Cloudflare Pages Functions
│   ├── [[path]].ts               # Catch-all route (Hono server)
│   └── _middleware.ts            # Security headers middleware
├── public/                       # Static assets (favicon, etc.)
├── .github/workflows/            # GitHub Actions for deployment
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Available Scripts

```bash
# Development
npm run dev           # Start Vite dev server (frontend)
npm run pages:dev     # Start Cloudflare Pages dev server (backend API via Pages Functions)

# Build & Type Checking
npm run build         # Build for production (TypeScript + Vite)
npm run type-check    # Run TypeScript type checking
npm run preview       # Preview production build locally

# Deployment
npm run pages:deploy  # Deploy to Cloudflare Pages (frontend + API via Pages Functions)

# Quick Deploy (Windows)
deploy.bat           # One-click deployment script
```

**Development Workflow:**
1. **Frontend**: `npm run dev` (runs on http://localhost:5173)
2. **Backend API**: `npm run pages:dev` (runs on http://localhost:8787 via Cloudflare Pages Functions)
3. **Full Stack**: Both servers run simultaneously for development
4. **API Routes**: All API calls use same-origin `/api/*` paths (no separate Worker service)

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

**Deployment Model**: QuakeWeather uses Cloudflare Pages with Pages Functions for both frontend and API. The API runs via `functions/[[path]].ts` which routes all requests to the Hono app in `src/server/index.ts`. No separate Worker service is needed.

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

## Deployment

### Quick Deploy (Windows)
```bash
deploy.bat
```

### Manual Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name=quakeweather --branch=main
```

### Environment Variables in Cloudflare Pages
Set these in Cloudflare Pages dashboard (Settings → Environment Variables → Production):

1. **VITE_MAPBOX_TOKEN** (Required for frontend)
   - Your Mapbox public access token
   - ⚠️ **Must be marked as "Available during build"** for Vite to inject it
   - Get your token from: https://account.mapbox.com/access-tokens/
   - This is injected at build time into the client bundle

2. **OPENWEATHER_API_KEY** (Required for backend API)
   - Your OpenWeather API key
   - Only needed at runtime in Pages Functions (not during build)
   - Get your key from: https://openweathermap.org/api

3. **COHERE_API_KEY** (Optional, for AI explanations)
   - Your Cohere API key
   - Only needed at runtime in Pages Functions (not during build)
   - Get your key from: https://cohere.com/

**⚠️ Important**: After setting environment variables, you must **redeploy** the project for them to take effect. Environment variables are only applied to new builds.

**📖 Detailed Setup Instructions**: See [CLOUDFLARE_PAGES_ENV_SETUP.md](CLOUDFLARE_PAGES_ENV_SETUP.md) for step-by-step instructions with screenshots.

**Note**: The API runs via Cloudflare Pages Functions (in the `functions/` folder), not a separate Worker service.

### ⚠️ Important: Cleanup Old Worker Service
If you have an old `quakeweather-api` Worker service in your Cloudflare dashboard, **delete it** - it's no longer needed. See [CLOUDFLARE_CLEANUP.md](CLOUDFLARE_CLEANUP.md) for step-by-step instructions.

## Troubleshooting

### Map doesn't load
- Verify `VITE_MAPBOX_TOKEN` is set in build environment or `.dev.vars`
- Check browser console for errors
- Ensure Pages dev server is running for local development: `npm run pages:dev`

### Weather API errors
- Verify `OPENWEATHER_API_KEY` is set in Cloudflare Pages environment variables
- Check rate limits (30 requests per 10 minutes)
- Restart Pages dev server after adding environment variables: `npm run pages:dev`

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check that `VITE_MAPBOX_TOKEN` is set for frontend builds
- Verify TypeScript compilation: `npm run type-check`

### Rate limit exceeded
- Wait 10 minutes (limit: 30 requests per 10 minutes per IP)
- Cache is enabled to reduce API calls
- Consider increasing rate limit in production if needed

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

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

## 🔮 Predict (Experimental) **NEW!**

⚠️ **CRITICAL DISCLAIMER**: This feature provides **experimental educational probabilities** based on statistical patterns in seismic data. Earthquake prediction is **NOT scientifically reliable**. These probabilities must **NEVER** be used for safety-critical decisions.

### What is Nowcasting?

**Nowcasting** is a probabilistic assessment of earthquake likelihood in the near future (1-7 days) based on:
- Recent seismicity patterns
- ETAS (Epidemic Type Aftershock Sequence) modeling
- Spatio-temporal clustering analysis
- Historical earthquake rates

This is **NOT deterministic prediction** - it provides statistical probabilities for educational purposes only.

### Features

#### 🗺️ **Nowcast Heatmap**
- **Probabilistic grid**: Shows probability of M≥4.5 earthquake in next 7 days per cell
- **ETAS-based**: Uses aftershock clustering physics
- **Real-time**: Updates based on latest seismic activity
- **Configurable**: Adjust horizon (1-7 days), M0 threshold (3.0-5.5), grid resolution

#### 💫 **Aftershock Probability Ring**
- **Event-specific**: Click any M≥5.0 earthquake to see aftershock probability
- **Spatial ring**: Shows probability zone around mainshock
- **Time-dependent**: Compute for 1h to 30 days ahead
- **ETAS kernel**: Based on Omori-Utsu law and spatial decay

#### 🤖 **AI Explanations** (Cohere-powered)
- **Natural language**: Explains why certain areas have elevated probabilities
- **Context-aware**: References recent significant earthquakes
- **Educational**: Emphasizes statistical nature of probabilities

#### 📊 **Model Metrics Dashboard**
- **AUC & Brier scores**: Model discrimination and calibration performance
- **Calibration plot**: Reliability diagram showing predicted vs observed frequencies
- **Feature importance**: Which seismicity patterns matter most
- **Training data stats**: Sample sizes, positive rates, evaluation dates

### How to Use

1. **Enable Predict Mode**: Click the "🔮 Predict (Experimental)" button (bottom-right)
2. **Configure Parameters**:
   - **Time Horizon**: 1-7 days (how far ahead to forecast)
   - **Min Magnitude (M0)**: 3.0-5.5 (minimum magnitude for "event")
   - **Grid Resolution**: 0.1°-1.0° (finer = more detailed, slower)
3. **View Heatmap**: Blue (low) → Yellow → Orange → Red (high probability)
4. **Check Aftershocks**: Click M≥5.0 earthquakes to see probability ring
5. **Get AI Explanation**: Click "🤖 AI Explanation" for narrative summary
6. **View Metrics**: Click "📊 View Model Metrics" to see model performance

### Technical Details

#### ETAS Model
```typescript
λ(t,x) = Σ K × exp(α(M - M₀)) × (t + c)^(-p) × (r² + d²)^(-q/2)
```
Where:
- `K`: Overall productivity (~0.02)
- `α`: Magnitude productivity (~1.1)
- `p`: Temporal decay (Omori, ~1.2)
- `c`: Temporal core (~0.01 days)
- `q`: Spatial decay (~1.5)
- `d`: Spatial core (~10 km)
- `M₀`: Reference magnitude (3.0)

#### Logistic Regression Features
- `rate_7`, `rate_30`, `rate_90`: Events per day in last 7/30/90 days
- `maxMag_7`, `maxMag_30`, `maxMag_90`: Max magnitude in windows
- `time_since_last`: Days since last M≥M0 event
- `etas`: ETAS intensity (λ) from kernel above

#### Training Process
1. **Data**: USGS catalog 2010-present for SE Asia (M≥4.0)
2. **Labels**: Binary (1 if M≥4.5 event within 7 days, 0 otherwise)
3. **Model**: L2-regularized logistic regression
4. **Calibration**: Platt scaling for probability calibration
5. **Validation**: Rolling time-split validation (no random CV)
6. **Metrics**: AUC ~0.72, Brier ~0.016

### API Endpoints

#### `GET /api/predict`
Compute nowcast probabilities for a grid.

**Query Parameters**:
- `bbox` (optional): `minLon,minLat,maxLon,maxLat`
- `cellDeg` (optional): Grid cell size (default 0.25°)
- `horizon` (optional): Days ahead (default 7)

**Response**: Array of cells with probabilities, λ values, features

**Rate Limit**: 30 req/10min per IP  
**Cache**: 15 minutes

#### `GET /api/aftershock`
Compute aftershock probability ring around a mainshock.

**Query Parameters**:
- `lat`, `lon`, `mag`, `time`: Mainshock parameters (required)
- `eventId` (optional): For caching
- `m0` (optional): Min magnitude threshold (default 3.0)
- `horizon` (optional): Days ahead (default 3 = 72h)
- `radius` (optional): Ring radius in km (default 150)

**Response**: Probability ring coordinates, statistics, ETAS λ

**Rate Limit**: 30 req/10min per IP  
**Cache**: 15 minutes

#### `POST /api/explain`
Generate AI narrative explaining predictions (Cohere).

**Request Body**:
```json
{
  "topCells": [{ "lat": 0, "lon": 0, "probability": 0.05 }, ...],
  "recentEvents": [{ "lat": 0, "lon": 0, "mag": 5.0, "time": 123, "place": "..." }, ...]
}
```

**Response**: Natural language explanation with disclaimer

**Rate Limit**: 30 req/10min per IP  
**Cache**: 15 minutes

### Training Your Own Model

```bash
# Install dependencies (includes tsx)
npm install

# Run unit tests
npm run test:etas

# Train model (requires internet for USGS data)
npm run train:model
```

**Output**:
- `public/models/nowcast.json` - Trained model with coefficients & calibration
- `public/models/nowcast_eval.json` - Performance metrics & reliability curve

**Tuning**: Edit `tools/backtest/config.ts` to change:
- Region (bbox)
- Grid resolution
- Time windows
- ETAS parameters

### Limitations & Disclaimers

⚠️ **This is an experimental educational tool. Earthquake prediction is NOT scientifically reliable.**

**Known Limitations**:
- **Simple model**: Logistic regression, not deep learning or physics-based
- **Limited features**: Only seismicity, no geophysical data (stress, GPS, etc.)
- **Regional**: Trained on specific regions, may not generalize globally
- **No guarantees**: Past patterns don't ensure future behavior
- **Educational only**: Never use for evacuation, construction, insurance, or any safety decision

**Appropriate Uses**:
- ✅ Learning about seismic clustering and aftershock patterns
- ✅ Understanding probabilistic forecasting concepts
- ✅ Exploring ETAS models and Omori's law
- ✅ Data science / geoscience education

**Inappropriate Uses**:
- ❌ Evacuation planning or emergency response
- ❌ Building safety assessments
- ❌ Insurance or financial decisions
- ❌ Public safety announcements
- ❌ Any safety-critical application

### Scientific Background

**Key Concepts**:
- **ETAS**: Epidemic Type Aftershock Sequence models cluster earthquakes in space and time
- **Omori's Law**: Aftershock rate decays as `(t + c)^(-p)` where p ≈ 1.0-1.3
- **Gutenberg-Richter**: Magnitude-frequency follows `log N = a - bM`
- **Poisson Process**: Background seismicity modeled as random point process

**References**:
- Ogata (1988): "Statistical Models for Earthquake Occurrences"
- Reasenberg & Jones (1989): "Earthquake Hazard After a Mainshock"
- Field et al. (2013): "Uniform California Earthquake Rupture Forecast (UCERF3)"

---

## Live Demo

### 🌐 Production URLs

- **Live App**: https://hesam.me/quakeweather/ (frontend + API via Pages Functions)
- **Cloudflare Pages**: https://quakeweather.hesam.me (alternative domain, if configured)

**⚠️ Important**: The app is deployed at `/quakeweather/` on `hesam.me`. All asset paths and API routes are configured to work with this base path. The Vite build is configured with `base: '/quakeweather/'` to ensure all assets load correctly.

### 🔧 Development URLs

- **Local Frontend**: http://localhost:5173
- **Local Backend API**: http://localhost:8787 (via `npm run pages:dev`)

---

## Security

This project follows security best practices:
- ✅ **Secret Scanning**: Automated scanning via [GitHub Actions](.github/workflows/secret-scan.yml) using [gitleaks](https://github.com/gitleaks/gitleaks)
- ✅ **Environment Variables Only**: All API keys stored in environment variables, never hardcoded
- ✅ **Git Protection**: `.env`, `.env.*`, and `.dev.vars` files are gitignored
- ✅ **Server-Side Proxy**: All external API calls go through backend proxy

**Documentation:**
- See [SECURITY.md](SECURITY.md) for security policy and key rotation procedures
- See [SCRIPTS_TO_RUN.md](SCRIPTS_TO_RUN.md) if you need to scrub git history

## Support

### 🐛 Issues & Questions

For issues, questions, or suggestions, please [open an issue](https://github.com/eamaster/quakeweather/issues) on GitHub.

---

**Built with ❤️ for education and exploration**

