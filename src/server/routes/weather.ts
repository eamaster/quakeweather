import { Hono } from 'hono';
import { Env } from '../lib/types';
import { CacheManager } from '../lib/cache';
import { fetchWeather } from '../lib/openweather';
import { weatherRateLimiter } from '../lib/rateLimit';
import { z } from 'zod';

const weatherRoute = new Hono<{ Bindings: Env }>();

const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  t: z.coerce.number().optional(),
});

weatherRoute.get('/', async (c) => {
  try {
    // Get client IP for rate limiting
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

    // Check rate limit
    const rateLimitResult = await weatherRateLimiter.checkLimit(clientIP);
    if (!rateLimitResult.allowed) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          message: 'Please wait before making more weather requests. Try zooming in or selecting fewer locations.',
        },
        429,
        {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        }
      );
    }

    const query = c.req.query();
    const { lat, lon, t } = weatherQuerySchema.parse(query);

    const timestamp = t || Date.now();
    const apiKey = c.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const cache = new CacheManager();
    const weather = await fetchWeather(lat, lon, timestamp, apiKey, cache);

    return c.json(weather, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return c.json(
        {
          error: 'Weather API rate limit exceeded',
          message: 'The weather service is temporarily unavailable. Please try again later.',
        },
        503
      );
    }

    return c.json(
      {
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default weatherRoute;

