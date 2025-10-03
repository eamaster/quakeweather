import { Hono } from 'hono';
import { Env } from '../lib/types';
import { CacheManager } from '../lib/cache';
import { fetchQuakeFeed, fetchQuakesFiltered, FeedType } from '../lib/usgs';
import { z } from 'zod';

const quakesRoute = new Hono<{ Bindings: Env }>();

const feedQuerySchema = z.object({
  feed: z
    .enum(['all_hour', 'all_day', '2.5_day', '4.5_week', 'significant_month'])
    .default('all_day'),
});

const filteredQuerySchema = z.object({
  starttime: z.string().optional(),
  endtime: z.string().optional(),
  minmagnitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  maxradiuskm: z.coerce.number().optional(),
});

quakesRoute.get('/', async (c) => {
  try {
    const cache = new CacheManager();
    const query = c.req.query();

    // Check if it's a filtered query
    if (
      query.starttime ||
      query.endtime ||
      query.minmagnitude ||
      (query.latitude && query.longitude)
    ) {
      const params = filteredQuerySchema.parse(query);
      const data = await fetchQuakesFiltered(params, cache);

      return c.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=90, stale-while-revalidate=60',
          'Content-Type': 'application/json',
        },
      });
    }

    // Default feed query
    const { feed } = feedQuerySchema.parse(query);
    const data = await fetchQuakeFeed(feed as FeedType, cache);

    return c.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=90, stale-while-revalidate=60',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching quakes:', error);
    return c.json(
      {
        error: 'Failed to fetch earthquake data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default quakesRoute;

