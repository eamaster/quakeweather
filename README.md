# QuakeWeather

> **Educational web app** that combines **USGS earthquake data** with **OpenWeather conditions** and provides **AI-generated insights**.

![QuakeWeather](https://img.shields.io/badge/status-production-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ⚠️ Important Disclaimer

**This tool is for education and exploration only.** Earthquake prediction is **not** scientifically reliable; outputs must not be used for safety-critical decisions. Weather and seismic activity are independent phenomena.

---

## Features

- 🗺️ **Interactive Mapbox GL map** with clustered earthquake visualization
- 🌍 **Real-time USGS earthquake data** with multiple feed options (hour/day/week/month)
- ☁️ **OpenWeather integration** showing current conditions and forecasts for earthquake locations
- 🤖 **AI-generated insights** with non-predictive contextual analysis
- 🎨 **Modern, responsive UI** with dark mode support
- 🚀 **Production-ready** with server-side caching and rate limiting
- ⚡ **Cloudflare Pages deployment** with edge functions for global performance

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
│   ├── client/          # React frontend
│   │   ├── components/  # UI components
│   │   ├── App.tsx      # Main app component
│   │   ├── main.tsx     # Entry point
│   │   ├── types.ts     # TypeScript types
│   │   └── styles.css   # Global styles
│   └── server/          # Backend API
│       ├── routes/      # API routes
│       ├── lib/         # Utilities and helpers
│       └── index.ts     # Hono app
├── functions/           # Cloudflare Pages Functions
├── public/              # Static assets
├── package.json
├── vite.config.ts
├── wrangler.toml
└── README.md
```

### Available Scripts

```bash
# Development
pnpm dev              # Start Vite dev server
pnpm worker:dev       # Start Wrangler dev server for API

# Build
pnpm build            # Build for production
pnpm type-check       # Run TypeScript type checking

# Preview
pnpm preview          # Preview production build locally

# Deployment
pnpm pages:deploy     # Deploy to Cloudflare Pages
```

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

Fetch weather data for a location.

**Query Parameters:**
- `lat` - Latitude (-90 to 90)
- `lon` - Longitude (-180 to 180)
- `t` - Timestamp (optional, defaults to current time)

**Response:** Weather data with current conditions

**Rate Limiting:** 30 requests per 10 minutes per IP

**Caching:** 10 minutes

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

### Cloudflare Pages

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   pnpm pages:deploy
   ```

3. **Set environment variables** in Cloudflare Dashboard:
   - Go to Pages → Your Project → Settings → Environment Variables
   - Add `OPENWEATHER_API_KEY` and `MAPBOX_TOKEN`

### GitHub Actions (Automated Deployment)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment on push to `main`.

**Required GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN` - API token from Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `OPENWEATHER_API_KEY` - OpenWeather API key
- `MAPBOX_TOKEN` - Mapbox access token

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

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/yourusername/quakeweather/issues) on GitHub.

---

**Built with ❤️ for education and exploration**

