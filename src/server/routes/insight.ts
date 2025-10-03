import { Hono } from 'hono';
import { Env, QuakeFeature, WeatherResponse } from '../lib/types';
import { CacheManager, cacheOptions } from '../lib/cache';
import { generateInsight } from '../lib/insight';
import { z } from 'zod';

const insightRoute = new Hono<{ Bindings: Env }>();

const insightQuerySchema = z.object({
  quakeId: z.string().optional(),
  mag: z.coerce.number().optional(),
  depth: z.coerce.number().optional(),
  place: z.string().optional(),
  time: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
});

insightRoute.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { quake, weather } = body as { quake: QuakeFeature; weather: WeatherResponse };

    if (!quake || !weather) {
      return c.json(
        {
          error: 'Missing required data',
          message: 'Both quake and weather data are required',
        },
        400
      );
    }

    const cacheKey = `insight:${quake.id}`;
    const cache = new CacheManager();

    // Check cache
    const cached = await cache.get(cacheKey);
    if (cached && !cache.isStale(cacheKey, cacheOptions.insight.ttl)) {
      return c.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'Content-Type': 'application/json',
        },
      });
    }

    const insight = generateInsight(quake, weather);

    // Cache result
    await cache.set(cacheKey, insight, cacheOptions.insight);

    return c.json(insight, {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating insight:', error);
    return c.json(
      {
        error: 'Failed to generate insight',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default insightRoute;

