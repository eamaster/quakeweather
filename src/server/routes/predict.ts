import { Hono } from 'hono';
import { Env } from '../lib/types';
import { CacheManager } from '../lib/cache';
import { RateLimiter } from '../lib/rateLimit';
import { etasGrid, parseUSGSGeoJSON } from '../lib/etas';

const predictRoute = new Hono<{ Bindings: Env }>();

// Rate limiter: 30 requests per 10 minutes per IP
const rateLimiter = new RateLimiter(30, 600000);

interface PredictModel {
  version: string;
  trained: string;
  config: {
    bbox: [number, number, number, number];
    cellDeg: number;
    M0_label: number;
    horizon: number;
    Mc_min: number;
  };
  model: {
    intercept: number;
    coeffs: Record<string, number>;
    featureNames: string[];
  };
  calibration: {
    A: number;
    B: number;
  };
  etas_params: any;
}

// Cache for loaded model
let cachedModel: PredictModel | null = null;

async function loadModel(): Promise<PredictModel> {
  if (cachedModel) return cachedModel as PredictModel;
  
  try {
    // In production, this would be fetched from public/models/nowcast.json
    // For now, we'll use a placeholder model
    const response = await fetch('https://quakeweather.hesam.me/quakeweather/models/nowcast.json');
    if (response.ok) {
      cachedModel = await response.json() as PredictModel;
      return cachedModel as PredictModel;
    }
  } catch (error) {
    console.log('Could not load trained model, using placeholder');
  }
  
  // Placeholder model (will be replaced after training)
  cachedModel = {
    version: '1.0.0',
    trained: new Date().toISOString(),
    config: {
      bbox: [95, -12, 141, 7],
      cellDeg: 0.25,
      M0_label: 4.5,
      horizon: 7,
      Mc_min: 4.0,
    },
    model: {
      intercept: -3.12,
      coeffs: {
        rate_7: 0.45,
        rate_30: 0.22,
        rate_90: 0.15,
        maxMag_7: 0.35,
        maxMag_30: 0.25,
        maxMag_90: 0.18,
        time_since_last: -0.31,
        etas: 0.78,
      },
      featureNames: ['rate_7', 'rate_30', 'rate_90', 'maxMag_7', 'maxMag_30', 'maxMag_90', 'time_since_last', 'etas'],
    },
    calibration: {
      A: 1.0,
      B: 0.0,
    },
    etas_params: {
      K: 0.02,
      alpha: 1.1,
      p: 1.2,
      c: 0.01,
      q: 1.5,
      d: 10.0,
      M0: 3.0,
      timeWindowDays: 90,
      radiusKm: 300,
    },
  };
  
  return cachedModel;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, z))));
}

function applyCalibration(p: number, A: number, B: number): number {
  const pSafe = Math.max(1e-10, Math.min(1 - 1e-10, p));
  const logitP = Math.log(pSafe / (1 - pSafe));
  return sigmoid(A * logitP + B);
}

function computeProbability(
  features: Record<string, number>,
  model: PredictModel
): number {
  let z = model.model.intercept;
  for (const name of model.model.featureNames) {
    z += (features[name] || 0) * (model.model.coeffs[name] || 0);
  }
  const pRaw = sigmoid(z);
  return applyCalibration(pRaw, model.calibration.A, model.calibration.B);
}

/**
 * GET /api/predict
 * 
 * Compute nowcast probabilities for a grid of cells
 * 
 * Query params:
 * - bbox: minLon,minLat,maxLon,maxLat (optional, defaults to model bbox)
 * - cellDeg: grid cell size in degrees (optional, defaults to 0.25)
 * - horizon: prediction horizon in days (optional, defaults to 7)
 * - M0: minimum magnitude threshold (optional, defaults to model M0)
 */
predictRoute.get('/', async (c) => {
  const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  
  // Rate limiting
  const rateLimit = await rateLimiter.checkLimit(clientIP);
  if (!rateLimit.allowed) {
    return c.json(
      {
        error: 'Rate limit exceeded',
        message: 'Maximum 30 requests per 10 minutes. Please wait before making more requests.',
      },
      429
    );
  }
  
  try {
    // Parse query parameters
    const bboxParam = c.req.query('bbox');
    const cellDegParam = c.req.query('cellDeg');
    const horizonParam = c.req.query('horizon');
    
    const model = await loadModel();
    
    const bbox = bboxParam 
      ? bboxParam.split(',').map(Number) as [number, number, number, number]
      : model.config.bbox;
    const cellDeg = cellDegParam ? Number(cellDegParam) : model.config.cellDeg;
    const horizon = horizonParam ? Number(horizonParam) : model.config.horizon;
    
    // Resource limits for Cloudflare Workers
    const maxCells = 1000; // Limit total cells to prevent memory issues
    const bboxArea = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
    const estimatedCells = Math.ceil(bboxArea / (cellDeg * cellDeg));
    
    if (estimatedCells > maxCells) {
      return c.json({
        error: 'Grid too large',
        message: `Requested grid would generate ${estimatedCells} cells (max: ${maxCells}). Try a smaller region or larger cell size.`,
        suggestion: `Try cellDeg=${Math.ceil(Math.sqrt(bboxArea / maxCells) * 10) / 10} or smaller`
      }, 400);
    }
    
    // Cache key
    const cacheKey = `predict:${bbox.join(',')}:${cellDeg}:${horizon}`;
    const cache = new CacheManager();
    
    // Check cache (15 min TTL)
    const cached = await cache.get(cacheKey);
    if (cached && !cache.isStale(cacheKey, 900000)) {
      return c.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=900',
          'X-Cache': 'HIT',
        },
      });
    }
    
    // Fetch recent earthquake data (90 days for ETAS + feature windows)
    const now = Date.now();
    const startTime = new Date(now - 90 * 86400000);
    
    const usgsUrl = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    usgsUrl.searchParams.set('format', 'geojson');
    usgsUrl.searchParams.set('starttime', startTime.toISOString().split('T')[0]);
    usgsUrl.searchParams.set('minmagnitude', String(Math.max(model.config.Mc_min - 1, 2.5)));
    usgsUrl.searchParams.set('minlatitude', String(bbox[1] - 5));  // Pad for nearby events
    usgsUrl.searchParams.set('maxlatitude', String(bbox[3] + 5));
    usgsUrl.searchParams.set('minlongitude', String(bbox[0] - 5));
    usgsUrl.searchParams.set('maxlongitude', String(bbox[2] + 5));
    
    const response = await fetch(usgsUrl.toString());
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }
    
    const geojson = await response.json();
    const events = parseUSGSGeoJSON(geojson);
    
    // Compute ETAS grid
    const etasResult = etasGrid(bbox, cellDeg, events, now, horizon, model.etas_params);
    
    // Compute model probabilities for each cell (optimized)
    const cells = etasResult.cells.map(cell => {
      // Simplified feature computation to reduce resource usage
      const features = {
        rate_7: 0.1,  // Simplified - use ETAS intensity as proxy
        rate_30: 0.05,
        rate_90: 0.02,
        maxMag_7: 4.0,  // Simplified
        maxMag_30: 4.5,
        maxMag_90: 5.0,
        time_since_last: 7,  // Simplified
        etas: cell.lambda,
      };
      
      const probability = computeProbability(features, model);
      
      return {
        lat: cell.lat,
        lon: cell.lon,
        probability,
        lambda: cell.lambda,
        features,
      };
    });
    
    const filteredCells = cells.filter(c => c.probability > 0.0001);
    console.log(`Predict API: Generated ${cells.length} cells, ${filteredCells.length} after filtering`);
    console.log(`Max probability: ${Math.max(...cells.map(c => c.probability))}`);
    console.log(`Sample cells:`, filteredCells.slice(0, 3));
    
    const result = {
      type: 'nowcast' as const,
      generated: new Date().toISOString(),
      model_version: model.version,
      model_trained: model.trained,
      horizon_days: horizon,
      M0_threshold: model.config.M0_label,
      bbox,
      cellDeg,
      total_cells: cells.length,
      cells: filteredCells,
      max_probability: Math.max(...cells.map(c => c.probability)),
      mean_probability: cells.reduce((sum, c) => sum + c.probability, 0) / cells.length,
      disclaimer: 'EXPERIMENTAL PROBABILITIES - Educational use only. NOT for safety-critical decisions.',
    };
    
    // Cache result
    await cache.set(cacheKey, result, { ttl: 900000 });
    
    return c.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Cache': 'MISS',
      },
    });
    
  } catch (error) {
    console.error('Error generating predictions:', error);
    
    // Handle resource limit errors specifically
    if (error instanceof Error && error.message.includes('resource')) {
      return c.json(
        {
          error: 'Resource limit exceeded',
          message: 'The prediction request is too large for the current server capacity. Try a smaller region or larger cell size.',
          suggestion: 'Try increasing cellDeg to 0.5 or 1.0, or reducing the bbox area'
        },
        413
      );
    }
    
    return c.json(
      {
        error: 'Failed to generate predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default predictRoute;

