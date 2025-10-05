import { Hono } from 'hono';
import { Env } from '../lib/types';
import { CacheManager } from '../lib/cache';
import { RateLimiter } from '../lib/rateLimit';
import { QuakeEvent, etasIntensity, probAtLeastOne } from '../lib/etas';

const aftershockRoute = new Hono<{ Bindings: Env }>();

// Rate limiter: 30 requests per 10 minutes per IP
const rateLimiter = new RateLimiter(30, 600000);

/**
 * GET /api/aftershock
 * 
 * Compute ETAS-based aftershock probability ring around a mainshock
 * 
 * Query params:
 * - eventId: USGS event ID (optional, for caching)
 * - lat: Latitude of mainshock (required)
 * - lon: Longitude of mainshock (required)
 * - mag: Magnitude of mainshock (required)
 * - time: Time of mainshock in ms (required)
 * - m0: Minimum magnitude threshold for aftershocks (optional, default 3.0)
 * - horizon: Time horizon in days (optional, default 3 = 72 hours)
 * - radius: Radius in km for probability ring (optional, default 150)
 * - nPoints: Number of points in ring (optional, default 64)
 */
aftershockRoute.get('/', async (c) => {
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
    // Parse parameters
    const eventId = c.req.query('eventId') || 'unknown';
    const lat = Number(c.req.query('lat'));
    const lon = Number(c.req.query('lon'));
    const mag = Number(c.req.query('mag'));
    const time = Number(c.req.query('time'));
    const m0 = Number(c.req.query('m0')) || 3.0;
    const horizon = Number(c.req.query('horizon')) || 3;  // 3 days = 72 hours
    const radius = Number(c.req.query('radius')) || 150;  // km
    const nPoints = Number(c.req.query('nPoints')) || 64;
    
    // Validate inputs
    if (!isFinite(lat) || !isFinite(lon) || !isFinite(mag) || !isFinite(time)) {
      return c.json(
        {
          error: 'Invalid parameters',
          message: 'lat, lon, mag, and time are required and must be valid numbers',
        },
        400
      );
    }
    
    // Cache key
    const cacheKey = `aftershock:${eventId}:${horizon}:${m0}:${radius}`;
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
    
    // Fetch recent earthquake data for ETAS calculation
    const now = Date.now();
    const lookbackDays = 90;  // ETAS time window
    const startTime = new Date(Math.min(time, now) - lookbackDays * 86400000);
    const endTime = new Date(Math.min(time, now));
    
    // Fetch from USGS
    const usgsUrl = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    usgsUrl.searchParams.set('format', 'geojson');
    usgsUrl.searchParams.set('starttime', startTime.toISOString().split('T')[0]);
    usgsUrl.searchParams.set('endtime', endTime.toISOString().split('T')[0]);
    usgsUrl.searchParams.set('minmagnitude', String(Math.max(m0 - 1, 2.5)));
    usgsUrl.searchParams.set('minlatitude', String(lat - 5));
    usgsUrl.searchParams.set('maxlatitude', String(lat + 5));
    usgsUrl.searchParams.set('minlongitude', String(lon - 5));
    usgsUrl.searchParams.set('maxlongitude', String(lon + 5));
    
    const response = await fetch(usgsUrl.toString());
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }
    
    const geojson = await response.json() as any;
    const events: QuakeEvent[] = (geojson.features || [])
      .map((f: any) => ({
        t: f.properties.time,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        mag: f.properties.mag,
      }))
      .filter((e: QuakeEvent) => e.t < time);  // Only events before mainshock
    
    // Add the mainshock itself
    events.push({ t: time, lat, lon, mag });
    
    // Compute ETAS intensity at center and probability
    const lambda = etasIntensity(events, time + 1000, lat, lon, {
      radiusKm: radius,
      timeWindowDays: lookbackDays,
    });
    
    const probability = probAtLeastOne(lambda, horizon);
    
    // Generate probability ring (circle of points)
    const ringPoints: { lat: number; lon: number; probability: number }[] = [];
    
    for (let i = 0; i < nPoints; i++) {
      const angle = (i / nPoints) * 2 * Math.PI;
      // Approximate point at radius km and bearing
      const latRad = lat * Math.PI / 180;
      const lonRad = lon * Math.PI / 180;
      const angularDist = radius / 6371;  // radius in radians
      
      const newLat = Math.asin(
        Math.sin(latRad) * Math.cos(angularDist) +
        Math.cos(latRad) * Math.sin(angularDist) * Math.cos(angle)
      );
      
      const newLon = lonRad + Math.atan2(
        Math.sin(angle) * Math.sin(angularDist) * Math.cos(latRad),
        Math.cos(angularDist) - Math.sin(latRad) * Math.sin(newLat)
      );
      
      const ringLat = newLat * 180 / Math.PI;
      const ringLon = newLon * 180 / Math.PI;
      
      // Compute ETAS intensity at this ring point
      const ringLambda = etasIntensity(events, time + 1000, ringLat, ringLon, {
        radiusKm: radius,
        timeWindowDays: lookbackDays,
      });
      
      const ringProb = probAtLeastOne(ringLambda, horizon);
      
      ringPoints.push({
        lat: ringLat,
        lon: ringLon,
        probability: ringProb,
      });
    }
    
    const result = {
      type: 'aftershock',
      generated: new Date().toISOString(),
      mainshock: {
        eventId,
        lat,
        lon,
        mag,
        time,
      },
      parameters: {
        m0_threshold: m0,
        horizon_days: horizon,
        radius_km: radius,
      },
      center_probability: probability,
      center_lambda: lambda,
      ring: ringPoints,
      statistics: {
        max_probability: Math.max(...ringPoints.map(p => p.probability)),
        mean_probability: ringPoints.reduce((sum, p) => sum + p.probability, 0) / ringPoints.length,
        min_probability: Math.min(...ringPoints.map(p => p.probability)),
      },
      recent_events_count: events.length,
      disclaimer: 'EXPERIMENTAL AFTERSHOCK PROBABILITIES - Educational use only. NOT for safety-critical decisions.',
    };
    
    // Cache result
    await cache.set(cacheKey, result, { ttl: 900000 });
    
    return c.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=900',
        'X-Cache': 'MISS',
      },
    });
    
  } catch (error) {
    console.error('Error computing aftershock probability:', error);
    return c.json(
      {
        error: 'Failed to compute aftershock probability',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default aftershockRoute;

