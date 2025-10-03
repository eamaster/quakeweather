import { WeatherResponse } from './types';
import { CacheManager, cacheOptions } from './cache';
import { roundCoordinate } from './utils';

const ONECALL_BASE = 'https://api.openweathermap.org/data/3.0/onecall';

export async function fetchWeather(
  lat: number,
  lon: number,
  timestamp: number,
  apiKey: string,
  cache: CacheManager
): Promise<WeatherResponse> {
  // Round coordinates for better cache hits
  const roundedLat = roundCoordinate(lat, 2);
  const roundedLon = roundCoordinate(lon, 2);

  const cacheKey = `weather:${roundedLat}:${roundedLon}`;

  // Check cache
  const cached = await cache.get<WeatherResponse>(cacheKey);
  if (cached && !cache.isStale(cacheKey, cacheOptions.weather.ttl)) {
    return cached;
  }

  // Build API URL
  const params = new URLSearchParams({
    lat: roundedLat.toString(),
    lon: roundedLon.toString(),
    units: 'metric',
    exclude: 'minutely',
    appid: apiKey,
  });

  const url = `${ONECALL_BASE}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Handle rate limits gracefully
    if (response.status === 429) {
      throw new Error('OpenWeather API rate limit exceeded');
    }
    throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Check if event time is in the past (approximate mode)
  const now = Date.now();
  const approximate = timestamp < now - 3600000; // More than 1 hour ago

  const result: WeatherResponse = {
    current: data.current,
    hourly: data.hourly?.slice(0, 8), // Next 8 hours
    daily: data.daily?.slice(0, 3), // Next 3 days
    alerts: data.alerts,
    approximate,
  };

  // Cache the result
  await cache.set(cacheKey, result, cacheOptions.weather);

  return result;
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function formatWeatherDescription(weather: any): string {
  if (!weather || !weather.length) return 'Unknown';
  return weather[0].description
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

