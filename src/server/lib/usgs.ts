import { QuakeCollection, QuakeFeature } from './types';
import { CacheManager, cacheOptions } from './cache';

const USGS_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';
const FDSN_BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export type FeedType = 'all_hour' | 'all_day' | '2.5_day' | '4.5_week' | 'significant_month';

const FEED_URLS: Record<FeedType, string> = {
  all_hour: `${USGS_BASE}/all_hour.geojson`,
  all_day: `${USGS_BASE}/all_day.geojson`,
  '2.5_day': `${USGS_BASE}/2.5_day.geojson`,
  '4.5_week': `${USGS_BASE}/4.5_week.geojson`,
  significant_month: `${USGS_BASE}/significant_month.geojson`,
};

export function calculateContextScore(feature: QuakeFeature, weather?: any): number {
  const mag = feature.properties.mag || 0;
  const depth = feature.geometry.coordinates[2] || 0;
  const windSpeed = weather?.current?.wind_speed || 0;
  const precipProb = weather?.hourly?.[0]?.pop || 0;

  // Weighted scoring (not predictive, just for ranking)
  const w1 = 10; // magnitude weight
  const w2 = 0.5; // depth weight
  const w3 = 0.3; // wind weight
  const w4 = 2; // precipitation probability weight

  const score = w1 * mag + w2 * Math.log(1 + depth) + w3 * windSpeed + w4 * precipProb;
  return Math.round(score * 100) / 100;
}

export async function fetchQuakeFeed(
  feedType: FeedType = 'all_day',
  cache: CacheManager
): Promise<QuakeCollection> {
  const url = FEED_URLS[feedType];
  const cacheKey = `quakes:${feedType}`;

  // Check cache
  const cached = await cache.get<QuakeCollection>(cacheKey);
  if (cached && !cache.isStale(cacheKey, cacheOptions.quakes.ttl)) {
    return cached;
  }

  // Fetch with conditional request
  const headers: HeadersInit = {
    'User-Agent': 'QuakeWeather/1.0',
  };

  const etag = await cache.getEtag(cacheKey);
  if (etag) {
    headers['If-None-Match'] = etag;
  }

  const response = await fetch(url, { headers });

  // If not modified, return cached
  if (response.status === 304 && cached) {
    return cached;
  }

  if (!response.ok) {
    throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
  }

  const data: QuakeCollection = await response.json();

  // Add context scores and log depth information for debugging
  data.features = data.features.map((feature) => {
    const depth = feature.geometry.coordinates[2];
    console.log(`Earthquake ${feature.id}: ${feature.properties.place} - Depth: ${depth} km`);
    
    return {
      ...feature,
      properties: {
        ...feature.properties,
        contextScore: calculateContextScore(feature),
      },
    };
  });

  // Cache the result
  const newEtag = response.headers.get('ETag') || undefined;
  await cache.set(cacheKey, data, cacheOptions.quakes, newEtag);

  return data;
}

export async function fetchQuakesFiltered(
  params: {
    starttime?: string;
    endtime?: string;
    minmagnitude?: number;
    latitude?: number;
    longitude?: number;
    maxradiuskm?: number;
  },
  cache: CacheManager
): Promise<QuakeCollection> {
  const searchParams = new URLSearchParams({
    format: 'geojson',
    orderby: 'time-asc',
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${FDSN_BASE}?${searchParams.toString()}`;
  const cacheKey = `quakes:filtered:${searchParams.toString()}`;

  // Check cache
  const cached = await cache.get<QuakeCollection>(cacheKey);
  if (cached && !cache.isStale(cacheKey, cacheOptions.quakes.ttl)) {
    return cached;
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'QuakeWeather/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`USGS FDSN API error: ${response.status} ${response.statusText}`);
  }

  const data: QuakeCollection = await response.json();

  // Add context scores
  data.features = data.features.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      contextScore: calculateContextScore(feature),
    },
  }));

  await cache.set(cacheKey, data, cacheOptions.quakes);

  return data;
}

