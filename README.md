# QuakeWeather

> **Educational web app** combining **USGS earthquake data** with **OpenWeather conditions** and **AI-generated insights**.

![QuakeWeather](https://img.shields.io/badge/status-production-green) ![License](https://img.shields.io/badge/license-MIT-blue)

**Live Demo:** [https://hesam.me/quakeweather](https://hesam.me/quakeweather)

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
  - Past Hour - All earthquakes in the last hour
  - Past Day - All earthquakes in the last 24 hours  
  - M2.5+ Day - Magnitude 2.5+ in the last day
  - M4.5+ Week - Magnitude 4.5+ in the last week
  - Significant Month - Significant earthquakes in the last month
- **Advanced filtering** with magnitude range slider (0.0 - 10.0)
- **Context scoring** for earthquake ranking and relevance

### ☁️ Smart Weather Integration
- **OpenWeather One Call API 3.0** with intelligent fallback system:
  - **Historical weather data** using timemachine endpoint for past earthquakes
  - **Current conditions** with 8-hour hourly forecasts
  - **Weather alerts** display when available
  - **Automatic fallback** to Current Weather API if One Call API unavailable
- **Weather details**: Temperature, humidity, pressure, wind speed/direction, visibility
- **Smart caching** with coordinate rounding for optimal performance

### 🤖 AI-Generated Insights
- **Rule-based contextual analysis** combining earthquake and weather data
- **Magnitude classification** (minor → light → moderate → strong → major)
- **Weather impact assessment** (wind effects, precipitation probability, pressure analysis)
- **Depth analysis** (shallow vs deep earthquake effects)
- **Educational disclaimers** emphasizing non-predictive nature

### 🔮 Predict (Experimental)
⚠️ **CRITICAL DISCLAIMER**: This feature provides **experimental educational probabilities** based on statistical patterns in seismic data. Earthquake prediction is **NOT scientifically reliable**. These probabilities must **NEVER** be used for safety-critical decisions.

#### Nowcast Heatmap
- **Probabilistic grid**: Shows probability of M≥4.5 earthquake in next 7 days per cell
- **ETAS-based**: Uses aftershock clustering physics (Epidemic Type Aftershock Sequence)
- **Real-time**: Updates based on latest seismic activity
- **Configurable**: Adjust horizon (1-7 days), M0 threshold (3.0-5.5), grid resolution

#### Aftershock Probability Ring
- **Event-specific**: Click any M≥5.0 earthquake to see aftershock probability
- **Spatial ring**: Shows probability zone around mainshock
- **Time-dependent**: Compute for 1h to 30 days ahead
- **ETAS kernel**: Based on Omori-Utsu law and spatial decay

#### AI Explanations (Cohere-powered)
- **Natural language**: Explains why certain areas have elevated probabilities
- **Context-aware**: References recent significant earthquakes
- **Educational**: Emphasizes statistical nature of probabilities

### 🎨 Modern UI/UX
- **Responsive design** optimized for mobile, tablet, and desktop
- **Dark mode** with system preference detection
- **Tailwind CSS** styling with smooth animations
- **Accessible components** with proper ARIA labels
- **Mobile hamburger menu** with slide-out sidebar

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
- **Cloudflare Workers** - Serverless edge functions
- **Hono** - Lightweight web framework
- **Zod** - Type-safe validation

### Data Sources
- **USGS Earthquake API** - Real-time seismic data
- **OpenWeather API** - Weather conditions
- **Mapbox** - Map tiles and geocoding
- **Cohere AI** (optional) - Natural language explanations

---

## 🚀 Deployment

This project is designed for **Cloudflare Workers and Pages** deployment.

### Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Wrangler CLI**: `npm install -g wrangler`
3. **API Keys**:
   - **OpenWeather**: [Sign up here](https://openweathermap.org/api)
   - **Mapbox**: [Get token here](https://account.mapbox.com/)
   - **Cohere** (optional): [Get API key here](https://cohere.com/)

### Deploy Backend (Cloudflare Worker)

1. **Set environment secrets:**
   ```bash
   npx wrangler secret put OPENWEATHER_API_KEY
   # Enter your OpenWeather API key when prompted
   
   npx wrangler secret put MAPBOX_TOKEN
   # Enter your Mapbox token when prompted
   
   npx wrangler secret put COHERE_API_KEY
   # Enter your Cohere API key when prompted (optional)
   ```

2. **Deploy the worker:**
   ```bash
   npx wrangler deploy
   ```

3. **Your API will be live at:** `https://quakeweather-api.smah0085.workers.dev`

### Deploy Frontend (Cloudflare Pages)

1. **Create `.env` file** in project root:
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=quakeweather --branch=main
   ```

3. **Set environment variables in Cloudflare Pages dashboard:**
   - Go to: Settings → Environment Variables
   - Add: `VITE_MAPBOX_TOKEN` = your Mapbox token

4. **Your app will be live at:** `https://quakeweather.pages.dev`

### Automatic Deployments (Optional)

Connect your GitHub repository to Cloudflare Pages for automatic deployments on every push:

1. Go to Cloudflare Pages dashboard
2. Click "Connect to Git"
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: Add all required variables

---

## API Endpoints

### `GET /api/quakes`

Fetch earthquake data from USGS.

**Query Parameters:**
- `feed` - Feed type: `all_hour`, `all_day`, `2.5_day`, `4.5_week`, `significant_month` (default: `all_day`)

**Response:** GeoJSON FeatureCollection with context scores

**Caching:** 90 seconds with stale-while-revalidate

---

### `GET /api/weather`

Fetch weather data for a location.

**Query Parameters:**
- `lat` - Latitude (-90 to 90)
- `lon` - Longitude (-180 to 180)
- `t` - Timestamp (optional, defaults to current time)

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

### `GET /api/predict` (Experimental)

Compute nowcast probabilities for a grid.

**Query Parameters**:
- `bbox` (optional): `minLon,minLat,maxLon,maxLat`
- `cellDeg` (optional): Grid cell size (default 0.25°)
- `horizon` (optional): Days ahead (default 7)

**Response**: Array of cells with probabilities, λ values, features

**Rate Limit**: 30 req/10min per IP  
**Cache**: 15 minutes

---

### `GET /api/aftershock` (Experimental)

Compute aftershock probability ring around a mainshock.

**Query Parameters**:
- `lat`, `lon`, `mag`, `time`: Mainshock parameters (required)
- `m0` (optional): Min magnitude threshold (default 3.0)
- `horizon` (optional): Days ahead (default 3 = 72h)
- `radius` (optional): Ring radius in km (default 150)

**Response**: Probability ring coordinates, statistics, ETAS λ

**Rate Limit**: 30 req/10min per IP  
**Cache**: 15 minutes

---

### `POST /api/explain` (Experimental)

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

---

## Security

### API Keys Management

**⚠️ NEVER commit API keys to Git!**

**For local development:**
- Create `.env` file (gitignored) with `VITE_MAPBOX_TOKEN`
- Create `.dev.vars` file (gitignored) with backend secrets

**For production (Cloudflare):**
- Use `npx wrangler secret put <KEY_NAME>` for Worker secrets
- Use Cloudflare Pages dashboard → Environment Variables for frontend variables

**If you've exposed credentials:**
1. ✅ Rotate all API keys immediately at provider websites
2. ✅ Remove them from Git history if committed
3. ✅ Use environment variables going forward

### Security Features

- ✅ API keys stored in environment variables (never in client bundle)
- ✅ Server-side proxy for all external API calls
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Rate limiting to prevent abuse

---

## Architecture

### Project Structure

```
quakeweather/
├── src/
│   ├── client/                    # React frontend
│   │   ├── components/            # UI components
│   │   ├── utils/                 # Client utilities
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # Entry point
│   │   └── types.ts              # TypeScript definitions
│   └── server/                   # Backend API
│       ├── routes/               # API route handlers
│       ├── lib/                  # Core utilities
│       └── index.ts              # Hono app initialization
├── functions/                    # Cloudflare Pages Functions
├── public/                       # Static assets
│   └── models/                   # ML models for predictions
├── tools/                        # Training and testing scripts
│   └── backtest/                 # Model training
├── wrangler.toml                # Cloudflare Workers config
└── vite.config.ts               # Vite configuration
```

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

4. **Predictions**
   - Server-side cache: 15 minutes
   - Expensive computation results cached

### Rate Limiting

- **Token bucket algorithm** for weather and prediction APIs
- **30 requests per 10 minutes** per IP address
- Graceful degradation with user-friendly error messages

---

## ETAS Model (Prediction Feature)

The prediction feature uses the **Epidemic Type Aftershock Sequence (ETAS)** model:

```
λ(t,x) = Σ K × exp(α(M - M₀)) × (t + c)^(-p) × (r² + d²)^(-q/2)
```

**Where:**
- `K`: Overall productivity (~0.02)
- `α`: Magnitude productivity (~1.1)
- `p`: Temporal decay (Omori, ~1.2)
- `c`: Temporal core (~0.01 days)
- `q`: Spatial decay (~1.5)
- `d`: Spatial core (~10 km)
- `M₀`: Reference magnitude (3.0)

**Logistic Regression Features:**
- `rate_7`, `rate_30`, `rate_90`: Events per day in last 7/30/90 days
- `maxMag_7`, `maxMag_30`, `maxMag_90`: Max magnitude in windows
- `time_since_last`: Days since last M≥M0 event
- `etas`: ETAS intensity (λ) from kernel above

**Model Training:**
```bash
npm run train:model  # Train custom model for your region
npm run test:etas    # Run unit tests
```

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

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **USGS** for providing real-time earthquake data
- **OpenWeather** for weather data API
- **Mapbox** for mapping infrastructure
- **Cloudflare** for edge computing platform
- **Cohere** for AI language model

---

## Support

### 📚 Documentation

- **Deployment**: See `HOW_TO_DEPLOY.md` for deployment instructions
- **Contributing**: See `CONTRIBUTING.md` for contribution guidelines
- **API Reference**: See API Endpoints section above

### 🐛 Issues & Questions

For issues, questions, or suggestions, please [open an issue](https://github.com/eamaster/quakeweather/issues) on GitHub.

### 🔑 Getting API Keys

You need to obtain your own API keys from:
- **OpenWeather**: Sign up at [OpenWeather](https://openweathermap.org/api) for free
- **Mapbox**: Get a token at [Mapbox Account](https://account.mapbox.com/)
- **Cohere** (optional): For AI explanations at [Cohere](https://cohere.com/)

**⚠️ Security Warning**: Never commit API keys to Git. Use environment variables and `.gitignore` them.

---

## Data Sources & Attribution

- **Earthquake Data**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/)
- **Weather Data**: [OpenWeather](https://openweathermap.org/)
- **Map Tiles**: [Mapbox](https://www.mapbox.com/)

---

**Built with ❤️ for education and exploration**
