import { WeatherResponse } from './types';
import { CacheManager, cacheOptions } from './cache';
import { roundCoordinate } from './utils';

// One Call API 3.0 (requires "One Call by Call" subscription)
// Fallback to Current Weather API if subscription not active
const ONECALL_BASE = 'https://api.openweathermap.org/data/3.0/onecall';
const CURRENT_WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/weather';

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

  // Check if this is historical data (more than 1 hour ago)
  const now = Date.now();
  const isHistorical = timestamp < now - 3600000; // More than 1 hour ago
  
  // Use different cache keys for historical vs current data
  const cacheKey = isHistorical 
    ? `weather:${roundedLat}:${roundedLon}:${Math.floor(timestamp / 3600000)}` // Cache by hour for historical
    : `weather:${roundedLat}:${roundedLon}`; // Cache by location for current

  // Check cache
  const cached = await cache.get<WeatherResponse>(cacheKey);
  if (cached && !cache.isStale(cacheKey, cacheOptions.weather.ttl)) {
    return cached;
  }

  // Try One Call API 3.0 first (if subscription is active)
  try {
    let oneCallUrl: string;
    
    if (isHistorical) {
      // Try timemachine endpoint for historical data first
      const timemachineParams = new URLSearchParams({
        lat: roundedLat.toString(),
        lon: roundedLon.toString(),
        dt: Math.floor(timestamp / 1000).toString(), // Convert to Unix timestamp
        units: 'metric',
        appid: apiKey,
      });
      oneCallUrl = `${ONECALL_BASE}/timemachine?${timemachineParams.toString()}`;
    } else {
      // Use current endpoint for recent data
      const oneCallParams = new URLSearchParams({
        lat: roundedLat.toString(),
        lon: roundedLon.toString(),
        units: 'metric',
        exclude: 'minutely', // Exclude minutely data to reduce response size
        appid: apiKey,
      });
      oneCallUrl = `${ONECALL_BASE}?${oneCallParams.toString()}`;
    }

    const oneCallResponse = await fetch(oneCallUrl);

    if (oneCallResponse.ok) {
      const data = await oneCallResponse.json() as any;
      
      let result: WeatherResponse;
      
      if (isHistorical) {
        // Historical data from timemachine endpoint
        result = {
          current: data.data[0], // Historical data is in data array
          hourly: [], // Not available in timemachine
          daily: [], // Not available in timemachine
          alerts: [], // Not available in timemachine
          approximate: false, // This is exact historical data
        };
      } else {
        // Current data from onecall endpoint
        result = {
          current: data.current,
          hourly: data.hourly?.slice(0, 8) || [], // Next 8 hours
          daily: data.daily?.slice(0, 3) || [], // Next 3 days
          alerts: data.alerts || [],
          approximate: false, // This is current data
        };
      }

      // Cache the result
      await cache.set(cacheKey, result, cacheOptions.weather);
      return result;
    } else if (isHistorical && oneCallResponse.status === 401) {
      // If timemachine endpoint fails with 401, try current endpoint as fallback
      console.log('Timemachine endpoint not available, trying current endpoint for historical data');
      const currentParams = new URLSearchParams({
        lat: roundedLat.toString(),
        lon: roundedLon.toString(),
        units: 'metric',
        exclude: 'minutely',
        appid: apiKey,
      });
      const currentUrl = `${ONECALL_BASE}?${currentParams.toString()}`;
      const currentResponse = await fetch(currentUrl);
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json() as any;
        const result: WeatherResponse = {
          current: currentData.current,
          hourly: currentData.hourly?.slice(0, 8) || [],
          daily: currentData.daily?.slice(0, 3) || [],
          alerts: currentData.alerts || [],
          approximate: true, // This is current data used for historical request
        };
        
        // Cache the result
        await cache.set(cacheKey, result, cacheOptions.weather);
        return result;
      }
    }
  } catch (error) {
    console.log('One Call API 3.0 not available, falling back to Current Weather API');
  }

  // Fallback to Current Weather API
  const currentParams = new URLSearchParams({
    lat: roundedLat.toString(),
    lon: roundedLon.toString(),
    units: 'metric',
    appid: apiKey,
  });

  const currentUrl = `${CURRENT_WEATHER_BASE}?${currentParams.toString()}`;
  const response = await fetch(currentUrl);

  if (!response.ok) {
    // Handle rate limits gracefully
    if (response.status === 429) {
      throw new Error('OpenWeather API rate limit exceeded');
    }
    throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;

  // Transform Current Weather API response to match WeatherResponse interface
  const result: WeatherResponse = {
    current: {
      dt: data.dt,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      dew_point: data.main.temp_min, // Approximate
      uvi: 0, // Not available in current weather API
      clouds: data.clouds?.all || 0,
      visibility: data.visibility || 10000,
      wind_speed: data.wind?.speed || 0,
      wind_deg: data.wind?.deg || 0,
      wind_gust: data.wind?.gust || 0,
      weather: data.weather || [],
    },
    hourly: [], // Not available in current weather API
    daily: [], // Not available in current weather API
    alerts: [], // Not available in current weather API
    approximate: isHistorical, // Only approximate if using fallback for historical data
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

