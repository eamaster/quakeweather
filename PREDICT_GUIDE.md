## 🔮 QuakeWeather Predict (Experimental) - Complete Guide

⚠️ **CRITICAL**: This feature is **experimental** and **educational only**. Earthquake prediction is **NOT scientifically reliable**. **NEVER** use these probabilities for safety-critical decisions.

---

## 🎯 What is This Feature?

**QuakeWeather Predict** adds experimental earthquake nowcasting capabilities using:

1. **ETAS (Epidemic Type Aftershock Sequence)** modeling
2. **Logistic regression** on seismicity features
3. **Probabilistic forecasting** for 1-7 day horizons
4. **Aftershock probability rings** around significant earthquakes
5. **AI-powered explanations** of predictions (Cohere)

---

## 🚀 Quick Start

### For Users (Frontend)

1. **Enable Predict Mode**:
   - Click the purple **"🔮 Predict (Experimental)"** button (bottom-right of map)
   - Toggle **"Enable Nowcast"** switch to ON

2. **Configure Parameters**:
   - **Time Horizon**: 1-7 days (default: 7)
   - **Min Magnitude (M0)**: 3.0-5.5 (default: 4.5)
   - **Grid Resolution**: 0.1°-1.0° (default: 0.25° ≈ 28km)

3. **View Heatmap**:
   - Blue → Yellow → Orange → Red (increasing probability)
   - Hover over cells to see exact probabilities
   - Higher values indicate elevated seismic activity patterns

4. **Check Aftershocks**:
   - Click any M≥5.0 earthquake marker
   - See probability ring showing aftershock zone
   - Radius and probability based on ETAS kernel

5. **Get AI Explanation**:
   - Click **"🤖 AI Explanation"** button
   - Reads natural language summary of why certain areas have elevated probabilities
   - Powered by Cohere AI

6. **View Model Metrics**:
   - Click **"📊 View Model Metrics"**
   - See AUC, Brier score, calibration plot
   - Review feature importance

---

## 🔧 For Developers (Training)

### Prerequisites

```bash
npm install  # Includes tsx for running TypeScript
```

### Run Unit Tests

```bash
npm run test:etas
```

**Tests**:
- ✅ Haversine distance calculations
- ✅ Poisson probability conversions
- ✅ ETAS intensity (no events, single, multiple)
- ✅ Magnitude scaling
- ✅ Temporal decay (Omori's law)
- ✅ Spatial decay
- ✅ Grid computation
- ✅ Edge cases & bounds checking
- ✅ Realistic aftershock scenarios

### Train Your Own Model

```bash
npm run train:model
```

**What it does**:
1. Fetches historical USGS data (2010-present, configurable region)
2. Generates spatial grid (e.g., 0.25° cells)
3. Extracts features for each cell at sampled time points
4. Labels cells (y=1 if M≥4.5 event within 7 days)
5. Trains L2-regularized logistic regression
6. Calibrates probabilities using Platt scaling
7. Evaluates on validation set (AUC, Brier, reliability)
8. Saves model to `public/models/nowcast.json`
9. Saves evaluation to `public/models/nowcast_eval.json`

**Training time**: ~5-30 minutes depending on region size and data volume

**Configuration**: Edit `tools/backtest/config.ts`

---

## ⚙️ Configuration

### Backtest Config (`tools/backtest/config.ts`)

```typescript
{
  // Region
  bbox: [95, -12, 141, 7],  // [minLon, minLat, maxLon, maxLat]
  cellDeg: 0.25,             // Grid cell size in degrees
  
  // Labels
  M0_label: 4.5,             // Minimum magnitude for "event"
  horizons: [1, 3, 7],       // Prediction horizons in days
  
  // Training period
  train_start: "2010-01-01",
  train_end: "now",
  holdout_days: 90,
  
  // Features
  rate_windows_days: [7, 30, 90],
  rate_radius_km: 100,
  
  // ETAS parameters
  etas: {
    K: 0.02,      // Productivity
    alpha: 1.1,   // Magnitude scaling
    p: 1.2,       // Temporal decay (Omori)
    c: 0.01,      // Temporal core (days)
    q: 1.5,       // Spatial decay
    d: 10.0,      // Spatial core (km)
    M0: 3.0,      // Reference magnitude
    timeWindowDays: 90,
    radiusKm: 300
  }
}
```

### Presets Available

- **`global`**: Worldwide, 0.5° grid, M≥4.5
- **`southeast_asia`**: Malaysia + Indonesia, 0.25° grid, M≥4.5 (default)
- **`california`**: CA only, 0.25° grid, M≥3.5
- **`japan`**: JP only, 0.25° grid, M≥3.5
- **`new_zealand`**: NZ only, 0.25° grid, M≥3.5
- **`ring_of_fire`**: Extended Pacific, 0.5° grid, M≥4.5

**To use a preset**:
```typescript
import { PRESETS } from './config';
const CONFIG = PRESETS.california;  // Use California preset
```

---

## 📊 Understanding the Model

### Features (8 total)

| Feature | Description | Typical Range |
|---------|-------------|---------------|
| `rate_7` | Events/day in last 7 days (100km radius) | 0-1.0 |
| `rate_30` | Events/day in last 30 days | 0-0.5 |
| `rate_90` | Events/day in last 90 days | 0-0.3 |
| `maxMag_7` | Max magnitude in last 7 days | 0-7.0 |
| `maxMag_30` | Max magnitude in last 30 days | 0-7.0 |
| `maxMag_90` | Max magnitude in last 90 days | 0-8.0 |
| `time_since_last` | Days since last M≥M0 event | 0-999 |
| `etas` | ETAS kernel intensity (λ) | 0-10.0 |

### Model Output

**Probability** = sigmoid( β₀ + Σ βᵢ × featureᵢ )

After Platt calibration: P_cal = sigmoid( A × logit(P_raw) + B )

**Interpretation**:
- **0-1%**: Background rate (low)
- **1-5%**: Elevated activity
- **5-15%**: High probability zone
- **>15%**: Very high (rare, usually post-mainshock)

### Performance Metrics

**AUC (Area Under ROC Curve)**:
- 0.5 = random guessing
- 0.7 = fair
- 0.8 = good
- 0.9+ = excellent

**Typical for seismic nowcasting**: 0.65-0.75

**Brier Score** (lower is better):
- 0.0 = perfect calibration
- 0.25 = always predicting 50%
- Typical: 0.01-0.02 (due to low base rate)

---

## 🔬 Scientific Background

### ETAS Model

**Epidemic Type Aftershock Sequence** (Ogata, 1988):

```
λ(t, x) = μ(x) + Σᵢ K × exp(α(Mᵢ - M₀)) × (t - tᵢ + c)^(-p) × (rᵢ² + d²)^(-q/2)
```

**Components**:
- **μ(x)**: Background rate (not included in our simplified version)
- **K × exp(α(M - M₀))**: Magnitude-dependent productivity
- **(t + c)^(-p)**: Omori temporal decay
- **(r² + d²)^(-q/2)**: Spatial decay

**Physics**:
- Large earthquakes trigger aftershocks
- Aftershock rate decays with time (Omori's law: ~1/t)
- Aftershocks cluster near mainshock (spatial decay)
- Larger mainshocks produce more aftershocks

### Why This Approach?

**✅ Advantages**:
- Based on well-established seismology (ETAS, Omori's law)
- Statistically calibrated and evaluated
- Computationally fast (no heavy ML models)
- Deployable on edge (Cloudflare Workers)
- Interpretable features

**❌ Limitations**:
- No fault geometry or stress transfer physics
- No geodetic data (GPS, InSAR)
- No fluid dynamics or pore pressure
- Simple logistic model (not deep learning)
- Regional training (doesn't generalize globally)

---

## 📡 API Reference

### GET /api/predict

**Purpose**: Compute nowcast heatmap

**Parameters**:
```
?bbox=minLon,minLat,maxLon,maxLat  # Optional, defaults to model bbox
&cellDeg=0.25                       # Optional, grid resolution
&horizon=7                          # Optional, days ahead
```

**Response**:
```json
{
  "type": "nowcast",
  "generated": "2025-10-05T12:00:00Z",
  "horizon_days": 7,
  "M0_threshold": 4.5,
  "cells": [
    {
      "lat": 0.125,
      "lon": 100.125,
      "probability": 0.023,
      "lambda": 0.15,
      "features": { "rate_7": 0.14, "etas": 0.08, ... }
    },
    ...
  ],
  "max_probability": 0.156,
  "mean_probability": 0.008,
  "disclaimer": "..."
}
```

### GET /api/aftershock

**Purpose**: Compute aftershock ring for a mainshock

**Parameters**:
```
?lat=35.0&lon=-120.0&mag=6.0&time=1728000000000  # Mainshock
&m0=3.0                                            # Optional, aftershock threshold
&horizon=3                                         # Optional, days (default 3 = 72h)
&radius=150                                        # Optional, km
```

**Response**:
```json
{
  "type": "aftershock",
  "mainshock": { "lat": 35.0, "lon": -120.0, "mag": 6.0, ... },
  "center_probability": 0.85,
  "center_lambda": 1.2,
  "ring": [
    { "lat": 35.1, "lon": -120.0, "probability": 0.45 },
    ...
  ],
  "statistics": {
    "max_probability": 0.85,
    "mean_probability": 0.52
  },
  "disclaimer": "..."
}
```

### POST /api/explain

**Purpose**: AI explanation of predictions (Cohere)

**Request**:
```json
{
  "topCells": [
    { "lat": 0, "lon": 100, "probability": 0.05 },
    ...
  ],
  "recentEvents": [
    { "lat": 0, "lon": 100, "mag": 5.5, "time": 123, "place": "..." },
    ...
  ]
}
```

**Response**:
```json
{
  "explanation": "The highest probabilities are concentrated near...",
  "disclaimer": "..."
}
```

---

## 🧪 Testing Checklist

### Unit Tests
```bash
npm run test:etas
```
**Expected**: 15/15 tests pass

**Tests cover**:
- Distance calculations (Haversine)
- Poisson probability conversions
- ETAS intensity (temporal, spatial, magnitude scaling)
- Grid computation
- Edge cases and bounds

### API Tests

**1. Health Check**:
```bash
curl http://localhost:8787/api/health
```
Should show `features: [..., 'predict', 'aftershock', 'explain']`

**2. Predict Endpoint**:
```bash
curl "http://localhost:8787/api/predict?bbox=95,-12,105,0&cellDeg=0.5&horizon=7"
```
Should return nowcast grid with probabilities

**3. Aftershock Endpoint**:
```bash
curl "http://localhost:8787/api/aftershock?lat=0&lon=100&mag=6.0&time=1728000000000&horizon=3"
```
Should return aftershock ring

**4. Explain Endpoint**:
```bash
curl -X POST http://localhost:8787/api/explain \
  -H "Content-Type: application/json" \
  -d '{"topCells":[{"lat":0,"lon":100,"probability":0.05}],"recentEvents":[]}'
```
Should return AI explanation (requires COHERE_API_KEY)

---

## 🎓 Educational Use Cases

### 1. Understanding Aftershock Patterns
- Enable aftershock rings for M≥5.0 events
- Observe how probability decays with distance
- Compare different mainshock magnitudes

### 2. Exploring Seismic Clustering
- Enable nowcast heatmap
- Watch how probabilities spike after significant earthquakes
- See temporal decay over days/weeks

### 3. Learning ETAS Parameters
- Modify `tools/backtest/config.ts`
- Change K, alpha, p, c, q, d parameters
- Retrain and compare performance

### 4. Model Calibration
- View calibration plot in metrics dashboard
- Understand predicted vs observed frequencies
- Learn about Brier scores and reliability

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch predictions"
**Cause**: Backend not running or rate limited  
**Fix**: 
- Ensure `npm run worker:dev` is running
- Wait 10 minutes if rate limited
- Check browser console for details

### Issue: "Model not found"
**Cause**: Model files not generated  
**Fix**:
```bash
npm run train:model  # Train and save model
npm run build        # Rebuild frontend to include models
```

### Issue: "Cohere API error"
**Cause**: Invalid or missing COHERE_API_KEY  
**Fix**:
- Add to `.dev.vars`: `COHERE_API_KEY=your_key_here`
- For production: `npx wrangler secret put COHERE_API_KEY`

### Issue: "Heatmap not showing"
**Cause**: All probabilities below display threshold (0.1%)  
**Fix**:
- Normal! Most areas have very low probabilities
- Zoom to regions with recent seismicity
- Lower M0 threshold or increase horizon

---

## 📚 References & Further Reading

### Scientific Papers
1. **Ogata, Y. (1988)**. "Statistical Models for Earthquake Occurrences and Residual Analysis for Point Processes." *Journal of the American Statistical Association*.

2. **Reasenberg, P. A., & Jones, L. M. (1989)**. "Earthquake Hazard After a Mainshock in California." *Science*, 243(4895), 1173-1176.

3. **Field, E. H., et al. (2013)**. "Uniform California Earthquake Rupture Forecast, Version 3 (UCERF3)." *USGS Open-File Report 2013-1165*.

4. **Zechar, J. D., & Jordan, T. H. (2008)**. "Testing alarm-based earthquake predictions." *Geophysical Journal International*, 172(2), 715-724.

### Online Resources
- **USGS Earthquake Forecasting**: https://www.usgs.gov/natural-hazards/earthquake-hazards/science/earthquake-forecasting
- **ETAS Model Explainer**: https://www.stat.berkeley.edu/~stark/Seminars/ogata08.pdf
- **Probabilistic Seismic Hazard**: https://earthquake.usgs.gov/hazards/

### Textbooks
- Stein, S., & Wysession, M. (2009). *An Introduction to Seismology, Earthquakes, and Earth Structure*.
- Utsu, T., Ogata, Y., & Matsu'ura, R. S. (1995). "The centenary of the Omori formula for a decay law of aftershock activity." *Journal of Physics of the Earth*.

---

## ⚠️ Ethical Guidelines

### DO:
- ✅ Use for education and learning
- ✅ Cite scientific uncertainties
- ✅ Show disclaimers prominently
- ✅ Compare with null models (baseline rates)
- ✅ Validate on holdout data
- ✅ Document limitations clearly

### DON'T:
- ❌ Make deterministic predictions ("earthquake will happen")
- ❌ Provide probabilities without disclaimers
- ❌ Use for emergency planning or public safety
- ❌ Claim scientific reliability
- ❌ Ignore model limitations
- ❌ Overfit to training data

---

## 🎯 Model Performance Expectations

### Realistic AUC Targets

| Region | Magnitude | Horizon | Expected AUC |
|--------|-----------|---------|--------------|
| California | M≥3.5 | 7 days | 0.68-0.75 |
| Japan | M≥3.5 | 7 days | 0.70-0.77 |
| SE Asia | M≥4.5 | 7 days | 0.65-0.72 |
| Global | M≥4.5 | 7 days | 0.60-0.68 |

**Why not higher?**
- Earthquakes have inherent randomness
- Limited features (no fault physics, stress data)
- Catalog incompleteness for small events
- Regional heterogeneity

**Anything above 0.70 is good** for this problem!

---

## 🚀 Deployment

### Environment Variables

**Development** (`.dev.vars`):
```env
OPENWEATHER_API_KEY=your_key
MAPBOX_TOKEN=your_token
COHERE_API_KEY=your_cohere_key  # NEW
```

**Production** (Cloudflare Workers):
```bash
npx wrangler secret put COHERE_API_KEY
# Enter: REMOVED_COHERE_API_KEY
```

### Deploy Updated Backend

```bash
# Deploy worker with new endpoints
npx wrangler deploy

# Or deploy to Pages
npm run build
npm run pages:deploy
```

---

## ❓ FAQ

**Q: Can this predict earthquakes?**  
A: No. It provides probabilities based on patterns, not deterministic predictions.

**Q: How accurate is it?**  
A: AUC ~0.72 means it's better than random (0.5) but far from perfect (1.0). Most areas have very low probabilities (<1%).

**Q: Should I evacuate if my area shows high probability?**  
A: **ABSOLUTELY NOT**. This is educational only. Consult official sources (USGS, local authorities) for safety decisions.

**Q: Why do probabilities change?**  
A: They update every 15 minutes based on latest seismicity. After significant earthquakes, nearby probabilities spike (ETAS aftershock clustering).

**Q: Can I train for my region?**  
A: Yes! Edit `tools/backtest/config.ts` and run `npm run train:model`.

**Q: Why is training slow?**  
A: Fetching years of USGS data and computing features for thousands of cells takes time. Consider smaller bbox or coarser grid.

**Q: What if my model performs poorly (AUC < 0.60)?**  
A: Normal for low-seismicity regions. Try:
- Longer training period
- Lower M0_label threshold
- Larger bbox to include more events
- Tune ETAS parameters

---

**Last Updated**: October 5, 2025  
**Model Version**: 1.0.0  
**Status**: ✅ Experimental - Educational Use Only


